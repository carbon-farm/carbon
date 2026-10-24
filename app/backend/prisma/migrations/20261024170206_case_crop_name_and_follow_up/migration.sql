-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "cropName" TEXT,
ADD COLUMN     "relatedCaseId" TEXT;

-- AlterTable
ALTER TABLE "KnowledgeArticle" ADD COLUMN     "cropName" TEXT;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_relatedCaseId_fkey" FOREIGN KEY ("relatedCaseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;
