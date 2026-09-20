-- One account type: everyone who signed up as a farmer or a HARIHARAA customer is now a
-- Member. The API already treats FARMER/CUSTOMER as MEMBER (normalizeRole), so this only
-- makes the stored data match. User IDs (HHF-/HHC-) are unchanged.
UPDATE "User" SET "role" = 'MEMBER' WHERE "role" IN ('FARMER', 'CUSTOMER');
