-- Data: shop categories asked for by the testers (2 Nov): pest-control traps and mother cultures.
-- Written to be safe to run twice and on a database that has had these added by hand:
-- a row is only inserted when no category of that name exists yet, and the parent is looked up by name.
INSERT INTO "ProductCategoryMaster" ("id", "name", "nameTe", "parentId", "sortOrder", "isActive")
SELECT gen_random_uuid()::text, 'Pest Control', 'చీడపీడల నివారణ',
  (SELECT "id" FROM "ProductCategoryMaster" WHERE "name" = 'Farm Inputs'), 4, true
WHERE NOT EXISTS (SELECT 1 FROM "ProductCategoryMaster" WHERE "name" = 'Pest Control');

INSERT INTO "ProductCategoryMaster" ("id", "name", "nameTe", "parentId", "sortOrder", "isActive")
SELECT gen_random_uuid()::text, 'Mother Cultures', 'మదర్ కల్చర్లు',
  (SELECT "id" FROM "ProductCategoryMaster" WHERE "name" = 'Farm Inputs'), 5, true
WHERE NOT EXISTS (SELECT 1 FROM "ProductCategoryMaster" WHERE "name" = 'Mother Cultures');

INSERT INTO "ProductCategoryMaster" ("id", "name", "nameTe", "parentId", "sortOrder", "isActive")
SELECT gen_random_uuid()::text, v.name, v.name_te,
  (SELECT "id" FROM "ProductCategoryMaster" WHERE "name" = 'Pest Control'), v.ord, true
FROM (VALUES
  ('Solar Light Traps', 'సోలార్ లైట్ ట్రాప్స్', 1),
  ('Sticky Traps', 'జిగురు ట్రాప్స్', 2),
  ('Pheromone Traps & Lures', 'ఫెరోమోన్ ట్రాప్స్ & ల్యూర్స్', 3)
) AS v(name, name_te, ord)
WHERE EXISTS (SELECT 1 FROM "ProductCategoryMaster" WHERE "name" = 'Pest Control')
  AND NOT EXISTS (SELECT 1 FROM "ProductCategoryMaster" c WHERE c."name" = v.name);
