ALTER TABLE public.provider_listings 
ADD COLUMN rate_type text NOT NULL DEFAULT 'per_hour',
ADD COLUMN rate_unit text NULL,
ADD COLUMN working_hours_per_day integer NULL;