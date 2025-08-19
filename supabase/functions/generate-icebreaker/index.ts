import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROMPT_TEMPLATE = `Write a warm, specific 2–3 sentence icebreaker using the context.
Rules: mention 1–2 concrete details, avoid clichés and generic praise, match the requested tone, end with a gentle question.
Context:
{{CONTEXT}}
User goal:
{{GOAL}}
Tone:
{{TONE}}`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileUrl, tone, goal } = await req.json();

    // Validate required inputs
    if (!profileUrl || !tone) {
      return new Response(
        JSON.stringify({ error: 'Profile URL and tone are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating icebreaker for:', { profileUrl, tone, goal });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Search for existing sources or fetch new data
    let searchResults;
    
    // Check if we already have data for this profile URL
    const { data: existingSources } = await supabase
      .from('sources')
      .select('*')
      .eq('profile_url', profileUrl)
      .limit(10);

    if (existingSources && existingSources.length > 0) {
      console.log(`Found ${existingSources.length} existing sources for ${profileUrl}`);
      searchResults = existingSources;
    } else {
      console.log('No existing sources found, fetching new data...');
      
      // Fetch new data using Tavily API
      const tavilyApiKey = Deno.env.get('TAVILY_API_KEY');
      if (!tavilyApiKey) {
        throw new Error('Tavily API key not configured');
      }

      const tavilyResponse = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: tavilyApiKey,
          query: profileUrl,
          search_depth: "basic",
          include_answer: false,
          include_images: false,
          include_raw_content: false,
          max_results: 3
        })
      });

      if (!tavilyResponse.ok) {
        throw new Error(`Tavily search failed: ${tavilyResponse.statusText}`);
      }

      const tavilyData = await tavilyResponse.json();
      console.log('Tavily search results:', tavilyData.results?.length || 0, 'results');

      if (!tavilyData.results || tavilyData.results.length === 0) {
        throw new Error('No search results found for the provided URL/keywords');
      }

      // Process and chunk the content
      const chunks = [];
      for (const result of tavilyData.results) {
        const content = `${result.title}\n${result.content}`;
        const chunkSize = 800;
        
        // Simple chunking by character count
        for (let i = 0; i < content.length; i += chunkSize) {
          const chunk = content.slice(i, i + chunkSize);
          if (chunk.trim().length > 50) { // Only keep meaningful chunks
            chunks.push({
              title: result.title,
              content: chunk.trim(),
              url: result.url
            });
          }
        }
      }

      console.log(`Created ${chunks.length} chunks from search results`);

      // Generate embeddings for chunks using Gemini
      const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
      if (!geminiApiKey) {
        throw new Error('Gemini API key not configured');
      }

      const sourcesToInsert = [];
      
      for (const chunk of chunks) {
        try {
          const embeddingResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'models/text-embedding-004',
                content: {
                  parts: [{ text: chunk.content }]
                }
              })
            }
          );

          if (!embeddingResponse.ok) {
            console.error('Embedding failed for chunk:', embeddingResponse.statusText);
            continue;
          }

          const embeddingData = await embeddingResponse.json();
          const embedding = embeddingData.embedding?.values;

          if (embedding && embedding.length === 768) {
            sourcesToInsert.push({
              profile_url: profileUrl,
              title: chunk.title,
              content: chunk.content,
              embedding: embedding
            });
          }
        } catch (error) {
          console.error('Error generating embedding:', error);
          continue;
        }
      }

      // Insert sources into database
      if (sourcesToInsert.length > 0) {
        const { data: insertedSources, error: insertError } = await supabase
          .from('sources')
          .insert(sourcesToInsert)
          .select('*');

        if (insertError) {
          console.error('Error inserting sources:', insertError);
          throw new Error('Failed to store source data');
        }

        searchResults = insertedSources;
        console.log(`Inserted ${insertedSources?.length || 0} new sources`);
      } else {
        throw new Error('Failed to process any content for embeddings');
      }
    }

    // Step 2: Generate query embedding and perform vector search
    const queryText = `${profileUrl} ${goal || ''}`;
    console.log('Generating embedding for query:', queryText);

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const queryEmbeddingResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: {
            parts: [{ text: queryText }]
          }
        })
      }
    );

    if (!queryEmbeddingResponse.ok) {
      throw new Error('Failed to generate query embedding');
    }

    const queryEmbeddingData = await queryEmbeddingResponse.json();
    const queryEmbedding = queryEmbeddingData.embedding?.values;

    if (!queryEmbedding || queryEmbedding.length !== 768) {
      throw new Error('Invalid query embedding received');
    }

    // Perform vector similarity search
    const { data: matchingSources, error: searchError } = await supabase
      .rpc('match_sources', {
        query_embedding: queryEmbedding,
        match_count: 6,
        similarity_threshold: 0.1
      });

    if (searchError) {
      console.error('Vector search error:', searchError);
      throw new Error('Failed to find relevant content');
    }

    console.log(`Found ${matchingSources?.length || 0} matching sources`);

    if (!matchingSources || matchingSources.length === 0) {
      throw new Error('No relevant content found for your query');
    }

    // Step 3: Generate icebreaker using Gemini
    const context = matchingSources
      .map(source => `${source.title}: ${source.content}`)
      .join('\n\n');

    const prompt = PROMPT_TEMPLATE
      .replace('{{CONTEXT}}', context)
      .replace('{{GOAL}}', goal || 'Start a meaningful conversation')
      .replace('{{TONE}}', tone);

    console.log('Generating icebreaker with Gemini...');

    const generationResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200
          }
        })
      }
    );

    if (!generationResponse.ok) {
      throw new Error(`Gemini generation failed: ${generationResponse.statusText}`);
    }

    const generationData = await generationResponse.json();
    const draft = generationData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!draft) {
      throw new Error('No icebreaker text generated');
    }

    console.log('Icebreaker generated successfully');

    // Return the result
    return new Response(
      JSON.stringify({
        draft: draft.trim(),
        sources: matchingSources.map(source => ({
          id: source.id,
          content: source.content,
          title: source.title,
          similarity: source.similarity
        }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in generate-icebreaker:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});