-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.match_sources(
  query_embedding vector(768),
  match_count int DEFAULT 6,
  similarity_threshold float DEFAULT 0.1
)
RETURNS TABLE (
  id uuid,
  content text,
  title text,
  profile_url text,
  similarity float
)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    sources.id,
    sources.content,
    sources.title,
    sources.profile_url,
    1 - (sources.embedding <=> query_embedding) AS similarity
  FROM public.sources
  WHERE 1 - (sources.embedding <=> query_embedding) > similarity_threshold
  ORDER BY sources.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Move vector extension to extensions schema (if exists) or keep in public as it's commonly accepted
-- The vector extension in public schema is generally acceptable for pgvector