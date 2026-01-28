-- Add service_radius column to provider_listings table
ALTER TABLE public.provider_listings 
ADD COLUMN service_radius integer DEFAULT 25;

-- Add latitude and longitude columns for map positioning
ALTER TABLE public.provider_listings 
ADD COLUMN latitude numeric,
ADD COLUMN longitude numeric;