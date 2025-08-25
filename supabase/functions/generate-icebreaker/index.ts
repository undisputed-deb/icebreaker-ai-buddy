// supabase/functions/generate-icebreaker/index.ts
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PROMPT_TEMPLATE = `You are a networking expert writing a highly personalized icebreaker message.

ANALYZE the context carefully and find the MOST SPECIFIC, RECENT, and INTERESTING details about this person/content.

Your icebreaker should:
1. Reference 2-3 CONCRETE, SPECIFIC details from the context
2. Show you've done research and found something genuinely interesting
3. Connect their background to the user's goal meaningfully
4. Be {{TONE}} in tone but substantive and professional
5. End with a thoughtful question that shows deep understanding

Context about this person/content:
{{CONTEXT}}

Platform detected: {{PLATFORM}}
User's goal: {{GOAL}}
Tone: {{TONE}}

AVOID generic phrases. Use specific facts from the context.
Write a 3-4 sentence icebreaker that demonstrates genuine research:`;

const WEBSITE_SUMMARY_TEMPLATE = `You are a technical analyst. Summarize the website from the extracted facts and snippets.

Produce a concise, factual summary (no flattery, no invented details) with bullets for:
- Title & meta description
- Tech stack clues (e.g., Next.js, Vercel) and why you think so
- Notable sections/headings and what they indicate
- Content/media counts (links, images) and any obvious CTAs or contact methods
- Anything clearly unique the page discloses

Context (facts/snippets):
{{CONTEXT}}

Write 5–8 short bullets, factual and specific. Avoid guessing names. End with one question that would clarify missing details.`;

const URL_PATTERNS = {
  linkedin: /linkedin\.com\/in\/([^\/]+)/i,
  github: /github\.com\/([^\/]+)(?:\/([^\/]+))?/i,
  twitter: /twitter\.com\/([^\/]+)|x\.com\/([^\/]+)/i,
  medium: /medium\.com\/@([^\/]+)|([^\/]+)\.medium\.com/i,
  devto: /dev\.to\/([^\/]+)/i,
  personal: /^https?:\/\/(?:www\.)?([^\/]+)/i,
  youtube: /youtube\.com\/(?:c\/|channel\/|user\/)?([^\/]+)/i,
};

function analyzeUrl(url: string) {
  const analysis = {
    type: "unknown",
    platform: "generic",
    username: "",
    repository: "",
    domain: "",
    isProfile: false,
    isProject: false,
    searchStrategies: [] as string[],
  };

  try {
    const urlObj = new URL(url);
    analysis.domain = urlObj.hostname;

    if (URL_PATTERNS.linkedin.test(url)) {
      const m = url.match(URL_PATTERNS.linkedin);
      analysis.type = "linkedin";
      analysis.platform = "LinkedIn";
      analysis.username = m?.[1] || "";
      analysis.isProfile = true;
      analysis.searchStrategies = [
        `"${analysis.username.replace(/-/g, " ")}" LinkedIn profile recent posts`,
        `"${analysis.username.replace(/-/g, " ")}" LinkedIn articles work experience`,
        `"${analysis.username.replace(/-/g, " ")}" professional background`,
        url,
      ];
    } else if (URL_PATTERNS.github.test(url)) {
      const m = url.match(URL_PATTERNS.github);
      analysis.type = "github";
      analysis.platform = "GitHub";
      analysis.username = m?.[1] || "";
      analysis.repository = m?.[2] || "";
      analysis.isProfile = !analysis.repository;
      analysis.isProject = !!analysis.repository;
      analysis.searchStrategies = analysis.isProject
        ? [
            `"${analysis.username}/${analysis.repository}" GitHub repository`,
            `"${analysis.repository}" project features documentation`,
            `${analysis.username} ${analysis.repository} code programming`,
            url,
          ]
        : [
            `"${analysis.username}" GitHub developer projects`,
            `"${analysis.username}" programming repositories`,
            `"${analysis.username}" open source contributions`,
            url,
          ];
    } else if (URL_PATTERNS.twitter.test(url)) {
      const m = url.match(URL_PATTERNS.twitter);
      analysis.type = "twitter";
      analysis.platform = "Twitter/X";
      analysis.username = m?.[1] || m?.[2] || "";
      analysis.isProfile = true;
      analysis.searchStrategies = [
        `"${analysis.username}" Twitter profile tweets`,
        `"@${analysis.username}" recent activity`,
        `"${analysis.username}" social media posts`,
        url,
      ];
    } else if (URL_PATTERNS.medium.test(url)) {
      const m = url.match(URL_PATTERNS.medium);
      analysis.type = "medium";
      analysis.platform = "Medium";
      analysis.username = m?.[1] || m?.[2] || "";
      analysis.isProfile = true;
      analysis.searchStrategies = [
        `"${analysis.username}" Medium articles blog posts`,
        `"${analysis.username}" Medium writer publications`,
        `site:medium.com ${analysis.username}`,
        url,
      ];
    } else {
      analysis.type = "website";
      analysis.platform = "Personal Website";
      analysis.domain = urlObj.hostname.replace("www.", "");
      analysis.searchStrategies = [
        url,
        `${analysis.domain} about portfolio projects`,
        `${analysis.domain} blog articles`,
        `site:${analysis.domain} about`,
      ];
    }

    return analysis;
  } catch (_) {
    return analysis;
  }
}

// ---------------- Tavily search ----------------
async function tavilySearch(
  query: string,
  key: string,
  depth: "basic" | "advanced" = "advanced",
) {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      query,
      search_depth: depth,
      include_answer: true,
      include_images: false,
      include_raw_content: true,
      max_results: 6,
      include_domains: [
        "linkedin.com",
        "github.com",
        "medium.com",
        "dev.to",
        "twitter.com",
      ],
    }),
  });
  if (!res.ok) throw new Error(`Tavily search failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

// ---------------- Website fetch & facts ----------------
async function fetchSite(url: string) {
  const res = await fetch(url, {
    headers: {
      // helps some sites return richer HTML
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });
  const html = await res.text();
  const headers: Record<string, string> = {};
  res.headers.forEach((v, k) => (headers[k.toLowerCase()] = v));
  return { html, headers };
}

function textBetween(html: string, re: RegExp) {
  const m = html.match(re);
  return (m?.[1] || "").trim();
}

function extractHeadings(html: string, tag: "h1" | "h2", limit = 3) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const arr: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) && arr.length < limit) {
    arr.push(m[1].replace(/<[^>]+>/g, "").trim());
  }
  return arr.filter(Boolean);
}

function detectStack(html: string, headers: Record<string, string>) {
  const clues: string[] = [];
  const hasNextData = html.includes("__NEXT_DATA__") || html.includes("/_next/");
  if (hasNextData) clues.push("Next.js (/_next assets or __NEXT_DATA__)");
  const server = headers["server"] || "";
  if (server.toLowerCase().includes("vercel")) clues.push("Vercel (server header)");
  if (/vite|astro|gatsby/i.test(html)) {
    const m = html.match(/vite|astro|gatsby/i);
    if (m) clues.push(m[0]);
  }
  if (/tailwind/i.test(html)) clues.push("Tailwind (class names)");
  return clues;
}

function extractSiteFacts(html: string, url: string, headers: Record<string, string>) {
  const title =
    textBetween(html, /<title[^>]*>([\s\S]*?)<\/title>/i) ||
    textBetween(html, /property=["']og:title["'][^>]*content=["']([^"']+)/i) ||
    "";
  const metaDesc =
    textBetween(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)/i) ||
    textBetween(html, /property=["']og:description["'][^>]*content=["']([^"']+)/i) ||
    "";
  const generator = textBetween(html, /<meta\s+name=["']generator["']\s+content=["']([^"']+)/i);
  const h1s = extractHeadings(html, "h1", 3);
  const h2s = extractHeadings(html, "h2", 5);

  const linkCount = (html.match(/<a\b[^>]*>/gi) || []).length;
  const imgCount = (html.match(/<img\b[^>]*>/gi) || []).length;

  const stack = detectStack(html, headers);
  if (generator) stack.push(`Generator: ${generator}`);

  const facts = [
    `URL: ${url}`,
    title ? `Title: ${title}` : "",
    metaDesc ? `Meta description: ${metaDesc}` : "",
    stack.length ? `Tech clues: ${stack.join(", ")}` : "",
    h1s.length ? `H1: ${h1s.join(" | ")}` : "",
    h2s.length ? `Top H2: ${h2s.slice(0, 3).join(" | ")}` : "",
    `Links: ${linkCount}, Images: ${imgCount}`,
  ]
    .filter(Boolean)
    .join("\n");

  const insights = {
    url,
    title: title || null,
    description: metaDesc || null,
    headings: { h1: h1s, h2: h2s },
    counts: { links: linkCount, images: imgCount },
    tech_clues: stack,
    server: headers["server"] || null,
  };

  return { facts, insights };
}

// ---------------- Embeddings ----------------
async function embedText(text: string, geminiKey: string) {
  for (let i = 0, delay = 2000; i < 3; i++, delay *= 2.5) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "models/text-embedding-004",
            content: { parts: [{ text }] },
          }),
        },
      );
      if (r.ok) {
        const j = await r.json();
        return j.embedding?.values as number[] | undefined;
      }
      if (r.status === 429 && i < 2) {
        const jitter = Math.random() * 1000;
        await new Promise((res) => setTimeout(res, delay + jitter));
        continue;
      }
      throw new Error(`Failed to embed: ${r.status} ${r.statusText}`);
    } catch (e) {
      if (i === 2) throw e;
    }
  }
  return undefined;
}

// ---------------- Generation ----------------
async function generateWithGemini(
  prompt: string,
  geminiKey: string,
  model: string,
  tries = 5,
) {
  let delay = 3000;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 250,
            },
          }),
        },
      );
      if (r.ok) {
        const j = await r.json();
        const result = (j.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
        if (result) return result;
        throw new Error("Empty response from Gemini");
      }
      if (r.status === 429 && i < tries - 1) {
        const jitter = Math.random() * 2000;
        await new Promise((res) => setTimeout(res, delay + jitter));
        delay *= 2.5;
        continue;
      }
      throw new Error(`${model} generation failed: ${r.status} ${r.statusText}`);
    } catch (e) {
      if (i === tries - 1) throw e;
    }
  }
  throw new Error(`${model} generation failed after ${tries} retries`);
}

function generateTemplateResponse(): string {
  const t = [
    "Here are a few quick observations based on the page content. (No personal details available.)",
    "High-level site notes: content detected but limited structured data; consider adding richer meta tags.",
    "Could you share which sections you’d like analyzed deeper (SEO, performance, content, or tech)?",
  ];
  return t[Math.floor(Math.random() * t.length)];
}

async function generateWithFallback(prompt: string, geminiKey: string) {
  try {
    return await generateWithGemini(prompt, geminiKey, "gemini-1.5-flash");
  } catch {
    try {
      return await generateWithGemini(prompt, geminiKey, "gemini-1.5-pro", 3);
    } catch {
      return generateTemplateResponse();
    }
  }
}

// ---------------- Process Tavily results to chunks ----------------
function processExtractedContent(results: any[], urlAnalysis: any) {
  const chunks: {
    title: string;
    content: string;
    source: string;
    priority: number;
    type: string;
  }[] = [];

  for (const r of results) {
    const title = r.title ?? "";
    const content = r.content ?? r.raw_content ?? "";
    const url = r.url ?? "";

    if (!content || content.length < 75) continue;

    let priority = 1;
    let contentType = "general";

    if (url.includes(urlAnalysis?.domain || "")) priority += 3;
    if (url.includes("linkedin.com")) {
      priority += 2;
      contentType = "professional";
    }
    if (url.includes("github.com")) {
      priority += 2;
      contentType = "technical";
    }
    if (url.includes("medium.com") || url.includes("dev.to")) {
      priority += 2;
      contentType = "articles";
    }

    if (title.toLowerCase().includes("about") || title.toLowerCase().includes("profile"))
      priority += 2;
    if (content.includes("experience") || content.includes("skills") || content.includes("projects"))
      priority += 1;

    const fullContent = `${title}\n${content}`.trim();
    for (let i = 0; i < fullContent.length; i += 600) {
      const part = fullContent.slice(i, i + 600).trim();
      if (part.length > 100) {
        chunks.push({ title, content: part, source: url, priority, type: contentType });
      }
    }
  }

  return chunks.sort((a, b) => b.priority - a.priority).slice(0, 30);
}

// ---------------- Main handler ----------------
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { profileUrl, tone, goal } = await req.json();
    if (!profileUrl || !tone) {
      return new Response(JSON.stringify({ error: "Profile URL and tone are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const TAVILY = Deno.env.get("TAVILY_API_KEY");
    const GEMINI = Deno.env.get("GEMINI_API_KEY");
    if (!TAVILY || !GEMINI) throw new Error("Server misconfigured: missing API keys");

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE);

    const isUrl =
      profileUrl.startsWith("http://") ||
      profileUrl.startsWith("https://") ||
      profileUrl.includes(".");
    const cacheKey = isUrl ? profileUrl : `keywords:${profileUrl}`;

    const { data: existing } = await sb
      .from("sources")
      .select("*")
      .eq("profile_url", cacheKey)
      .limit(15);

    let urlAnalysis: any = null;
    let extractedData: any = null;

    if (!existing || existing.length === 0) {
      if (isUrl) {
        extractedData = await extractWebsiteContent(profileUrl, TAVILY);
        urlAnalysis = extractedData.analysis;
      } else {
        const searchResult = await tavilySearch(profileUrl, TAVILY, "advanced");
        extractedData = {
          analysis: { type: "keywords", platform: "Search Results", domain: "various" },
          results: searchResult?.results || [],
          totalResults: searchResult?.results?.length || 0,
        };
      }

      if (extractedData.results.length) {
        const chunks = processExtractedContent(extractedData.results, urlAnalysis || {});
        const rows: any[] = [];
        for (const chunk of chunks.slice(0, 20)) {
          try {
            const vec = await embedText(chunk.content, GEMINI);
            if (vec && vec.length === 768) {
              rows.push({
                profile_url: cacheKey,
                title: chunk.title,
                content: chunk.content,
                embedding: vec as unknown as any,
              });
            }
          } catch (_) {}
        }
        if (rows.length) await sb.from("sources").insert(rows);
      }
    }

    // Retrieval — strict to this cacheKey
    let matches: any[] = [];
    try {
      const qvec = await embedText(
        `${profileUrl} ${goal ?? ""} recent work projects achievements`.trim(),
        GEMINI,
      );
      if (qvec && qvec.length === 768) {
        const { data: rows } = await sb.rpc("match_sources", {
          query_embedding: qvec,
          match_count: 12,
          similarity_threshold: 0.55,
        });
        matches = (rows ?? []).filter((r: any) => r.profile_url === cacheKey).slice(0, 6);
      }
    } catch (_) {}

    const platformInfo =
      (urlAnalysis && urlAnalysis.platform) ||
      (isUrl ? analyzeUrl(profileUrl).platform : "Search Results");

    // --- Website analysis mode? ---
    const wantData =
      /data|info|information|details|about|stats|analy(s|z)e/i.test(goal || "") ||
      /\.vercel\.app/i.test(profileUrl) ||
      (urlAnalysis?.type === "website");

    let siteFactsStr = "";
    let insights: any = null;

    if (isUrl && wantData) {
      try {
        const { html, headers } = await fetchSite(profileUrl);
        const { facts, insights: siteInsights } = extractSiteFacts(html, profileUrl, headers);
        siteFactsStr = facts;
        insights = siteInsights;
      } catch (e) {
        console.log("Site fetch failed:", (e as Error).message);
      }
    }

    // Build context & choose prompt
    let context = "";
    if (matches.length) {
      context = matches
        .map((m: any, i: number) => `[Source ${i + 1}] ${m.title}: ${m.content}`)
        .join("\n\n");
    }
    if (siteFactsStr) {
      context = `${siteFactsStr}\n\n${context}`.trim();
    }
    const usingWebsiteTemplate = Boolean(siteFactsStr) && wantData;

    const prompt = (usingWebsiteTemplate ? WEBSITE_SUMMARY_TEMPLATE : PROMPT_TEMPLATE)
      .replace("{{CONTEXT}}", context || "(no reliable person-specific context)")
      .replace("{{PLATFORM}}", platformInfo)
      .replace("{{GOAL}}", goal || (usingWebsiteTemplate ? "Summarize the website" : "Start a meaningful professional conversation"))
      .replace("{{TONE}}", tone);

    const draft = await generateWithFallback(prompt, GEMINI);

    return new Response(
      JSON.stringify({
        draft,
        mode: usingWebsiteTemplate ? "website_summary" : "icebreaker",
        analysis: {
          input_type: isUrl ? "url" : "keywords",
          platform_detected: platformInfo,
          profile_type: urlAnalysis?.isProfile
            ? "profile"
            : urlAnalysis?.isProject
            ? "project"
            : "content",
          domain: urlAnalysis?.domain || "various",
          username: urlAnalysis?.username || "",
          repository: urlAnalysis?.repository || "",
        },
        insights, // <- extra structured data for websites
        sources: (matches || []).slice(0, 5).map((s: any) => ({
          title: s.title,
          content_preview: s.content.substring(0, 150) + "...",
          similarity: s.similarity,
        })),
        context_quality: matches.length > 4 ? "high" : matches.length > 1 ? "medium" : "low",
        total_sources_found: extractedData?.totalResults || matches.length,
        model_used: "gemini",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("Universal analyzer error:", err);
    return new Response(
      JSON.stringify({
        error: err?.message || "Analysis failed",
        fallback_message:
          "Couldn’t analyze that page right now. Try again or paste a different URL.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
