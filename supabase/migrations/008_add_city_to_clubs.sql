-- PHASE 2: Growth Features - Rain-Check System
-- Adds a city column to the clubs table for weather lookups.

ALTER TABLE clubs ADD COLUMN IF NOT EXISTS city TEXT;
