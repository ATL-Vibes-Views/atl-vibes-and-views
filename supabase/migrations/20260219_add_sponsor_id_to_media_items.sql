-- Add sponsor_id to media_items so podcast episodes can be linked to sponsors
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS sponsor_id uuid REFERENCES sponsors(id);
