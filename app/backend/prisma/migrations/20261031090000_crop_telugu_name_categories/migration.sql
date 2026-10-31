-- A crop can carry its Telugu name and the picker groups it belongs to. Additive: both columns are
-- optional for existing rows (no name, no groups) until the crop list is imported or edited.
ALTER TABLE "CropMaster" ADD COLUMN "nameTe" TEXT,
ADD COLUMN "categories" TEXT[] DEFAULT ARRAY[]::TEXT[];
