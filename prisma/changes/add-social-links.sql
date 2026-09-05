-- Additive change. NULL preserves the existing Facebook/Instagram/YouTube links.
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "socialLinks" JSONB;
