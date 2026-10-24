-- CreateEnum
CREATE TYPE "CaseEventKind" AS ENUM ('SUBMITTED', 'ASSIGNED', 'FOLLOW_UP_ASKED', 'FOLLOW_UP_ANSWERED', 'ANSWERED', 'DISPUTED', 'CONFIRMED');

-- AlterTable
ALTER TABLE "FarmLand" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CaseEvent" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "kind" "CaseEventKind" NOT NULL,
    "actorId" TEXT,
    "text" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CaseEvent_caseId_createdAt_idx" ON "CaseEvent"("caseId", "createdAt");

-- AddForeignKey
ALTER TABLE "CaseEvent" ADD CONSTRAINT "CaseEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: give every existing case the history that can still be worked out from its row, so
-- the conversation is not blank for cases opened before this change. (A case row only holds the
-- latest answer, so earlier disputed answers cannot be recovered — they are recorded from now on.)
INSERT INTO "CaseEvent" ("id", "caseId", "kind", "actorId", "text", "createdAt")
SELECT gen_random_uuid()::text, c."id", 'SUBMITTED', c."farmerId", c."problemDescription", c."submittedAt"
FROM "Case" c WHERE c."submittedAt" IS NOT NULL;

INSERT INTO "CaseEvent" ("id", "caseId", "kind", "actorId", "text", "createdAt")
SELECT gen_random_uuid()::text, c."id", 'FOLLOW_UP_ASKED', c."assignedExpertId", c."followUpQuestion", c."updatedAt" - interval '2 minutes'
FROM "Case" c WHERE c."followUpQuestion" IS NOT NULL;

INSERT INTO "CaseEvent" ("id", "caseId", "kind", "actorId", "text", "createdAt")
SELECT gen_random_uuid()::text, c."id", 'FOLLOW_UP_ANSWERED', c."farmerId", c."followUpResponse", c."updatedAt" - interval '1 minute'
FROM "Case" c WHERE c."followUpResponse" IS NOT NULL;

INSERT INTO "CaseEvent" ("id", "caseId", "kind", "actorId", "text", "createdAt")
SELECT gen_random_uuid()::text, c."id", 'ANSWERED', c."assignedExpertId", c."resolutionNotes", c."updatedAt"
FROM "Case" c WHERE c."resolutionNotes" IS NOT NULL;

INSERT INTO "CaseEvent" ("id", "caseId", "kind", "actorId", "text", "createdAt")
SELECT gen_random_uuid()::text, c."id", 'CONFIRMED', c."farmerId", NULL, GREATEST(c."closedAt", c."updatedAt") + INTERVAL '1 second'
FROM "Case" c WHERE c."closureReason" = 'RESOLVED' AND c."closedAt" IS NOT NULL;
