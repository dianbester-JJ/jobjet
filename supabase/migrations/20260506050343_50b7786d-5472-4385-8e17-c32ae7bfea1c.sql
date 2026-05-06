CREATE TABLE public.completed_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  completed_at DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.completed_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view completed jobs"
  ON public.completed_jobs FOR SELECT USING (true);

CREATE POLICY "Providers can insert own completed jobs"
  ON public.completed_jobs FOR INSERT WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update own completed jobs"
  ON public.completed_jobs FOR UPDATE USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete own completed jobs"
  ON public.completed_jobs FOR DELETE USING (auth.uid() = provider_id);

CREATE TRIGGER update_completed_jobs_updated_at
  BEFORE UPDATE ON public.completed_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_completed_jobs_provider_created ON public.completed_jobs(provider_id, created_at DESC);