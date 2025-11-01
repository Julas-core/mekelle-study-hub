-- Add type field to materials table to distinguish between materials and exams
ALTER TABLE materials ADD COLUMN IF NOT EXISTS material_type text NOT NULL DEFAULT 'material';

-- Add a check constraint to ensure valid types
ALTER TABLE materials ADD CONSTRAINT materials_type_check 
  CHECK (material_type IN ('material', 'exam'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(material_type);

-- Add exam-specific fields
ALTER TABLE materials ADD COLUMN IF NOT EXISTS exam_year text;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS exam_semester text;