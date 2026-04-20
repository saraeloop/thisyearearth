CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pledge_text TEXT NOT NULL,
  name TEXT,
  country TEXT,
  country_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pledges_pledge_text_length_check
    CHECK (char_length(pledge_text) BETWEEN 3 AND 80),
  CONSTRAINT pledges_country_code_length_check
    CHECK (country_code IS NULL OR char_length(country_code) = 2)
);

CREATE INDEX IF NOT EXISTS pledges_created_at_idx
  ON pledges (created_at DESC);

CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  country_code TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT locations_country_code_length_check
    CHECK (char_length(country_code) = 2),
  CONSTRAINT locations_lat_check
    CHECK (lat IS NULL OR (lat >= -90 AND lat <= 90)),
  CONSTRAINT locations_lng_check
    CHECK (lng IS NULL OR (lng >= -180 AND lng <= 180))
);

CREATE UNIQUE INDEX IF NOT EXISTS locations_country_coords_unique
  ON locations (country_code, lat, lng) NULLS NOT DISTINCT;

CREATE INDEX IF NOT EXISTS locations_created_at_idx
  ON locations (created_at DESC);
