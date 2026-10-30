-- The unit ("per kg", "per bag") each line was sold in, kept on the order like the name and price are,
-- so the receipt can show it. Additive and nullable. Existing lines are filled from their product's
-- current unit (best available for orders placed before this).
ALTER TABLE "OrderItem" ADD COLUMN "unit" TEXT;

UPDATE "OrderItem" oi
SET "unit" = p."unit"
FROM "Product" p
WHERE p."id" = oi."productId";
