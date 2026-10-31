-- The groups crops are filed under in the pickers (categories and their sub-categories), so an
-- Administrator can add and rename them without a code change. Additive; a crop keeps pointing at
-- its groups by key in CropMaster."categories". The groups below are the ones from the testers'
-- "OCF Crop Category" sheet.
CREATE TABLE "CropCategoryMaster" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "parentKey" TEXT,
    "nameEn" TEXT NOT NULL,
    "nameTe" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CropCategoryMaster_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CropCategoryMaster_key_key" ON "CropCategoryMaster"("key");

INSERT INTO "CropCategoryMaster" ("id", "key", "parentKey", "nameEn", "nameTe", "sortOrder") VALUES
  (gen_random_uuid()::text, 'vegetables', NULL, 'Vegetables', 'కూరగాయలు', 10),
  (gen_random_uuid()::text, 'veg-fruiting', 'vegetables', 'Fruiting vegetables', 'కాయ కూరగాయలు', 20),
  (gen_random_uuid()::text, 'veg-gourds', 'vegetables', 'Gourds (creepers)', 'తీగ కూరగాయలు', 30),
  (gen_random_uuid()::text, 'veg-beans', 'vegetables', 'Beans', 'చిక్కుడు జాతి', 40),
  (gen_random_uuid()::text, 'veg-leafy', 'vegetables', 'Leafy vegetables', 'ఆకు కూరలు', 50),
  (gen_random_uuid()::text, 'veg-root', 'vegetables', 'Root & tuber vegetables', 'దుంప కూరగాయలు', 60),
  (gen_random_uuid()::text, 'veg-cole', 'vegetables', 'Cole crops', 'క్యాబేజీ జాతి', 70),
  (gen_random_uuid()::text, 'field', NULL, 'Field crops', 'పొల పంటలు', 80),
  (gen_random_uuid()::text, 'pulses', NULL, 'Pulses', 'పప్పు ధాన్యాలు', 90),
  (gen_random_uuid()::text, 'oilseeds', NULL, 'Oil seeds', 'నూనె గింజలు', 100),
  (gen_random_uuid()::text, 'flowers', NULL, 'Flowers', 'పూలు', 110),
  (gen_random_uuid()::text, 'aromatic', NULL, 'Aromatic oil crops', 'సుగంధ నూనె పంటలు', 120),
  (gen_random_uuid()::text, 'commercial', NULL, 'Commercial field crops', 'వాణిజ్య పంటలు', 130),
  (gen_random_uuid()::text, 'hardwood', NULL, 'Hardwood plants', 'గట్టి కలప మొక్కలు', 140),
  (gen_random_uuid()::text, 'medicinal', NULL, 'Medicinal plants', 'ఔషధ మొక్కలు', 150),
  (gen_random_uuid()::text, 'fruit', NULL, 'Fruit plants', 'పండ్ల మొక్కలు', 160);
