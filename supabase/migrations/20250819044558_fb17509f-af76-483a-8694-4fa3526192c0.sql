-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create sources table for storing chunked content with embeddings
CREATE TABLE public.sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_url TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create drafts table for storing generated icebreakers
CREATE TABLE public.drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_url TEXT NOT NULL,
  query TEXT NOT NULL,
  tone TEXT NOT NULL,
  goal TEXT,
  draft TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) on both tables
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access for now (can be restricted later with auth)
CREATE POLICY "Allow public access to sources" ON public.sources FOR ALL USING (true);
CREATE POLICY "Allow public access to drafts" ON public.drafts FOR ALL USING (true);

-- Create function for vector similarity search
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

-- Create index for faster vector similarity search
CREATE INDEX ON public.sources USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);