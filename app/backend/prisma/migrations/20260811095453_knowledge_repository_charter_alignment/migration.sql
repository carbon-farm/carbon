-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "cropId" TEXT;

-- AlterTable
ALTER TABLE "KnowledgeArticle" DROP COLUMN "content",
ADD COLUMN     "cropId" TEXT,
ADD COLUMN     "evidenceMediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "expertSolution" TEXT NOT NULL,
ADD COLUMN     "problemDescription" TEXT NOT NULL,
ADD COLUMN     "sourceCaseId" TEXT NOT NULL,
ADD COLUMN     "symptoms" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "_KnowledgeArticleToTagMaster" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_KnowledgeArticleToTagMaster_AB_unique" ON "_KnowledgeArticleToTagMaster"("A", "B");

-- CreateIndex
CREATE INDEX "_KnowledgeArticleToTagMaster_B_index" ON "_KnowledgeArticleToTagMaster"("B");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeArticle_sourceCaseId_key" ON "KnowledgeArticle"("sourceCaseId");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "CropMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeArticle" ADD CONSTRAINT "KnowledgeArticle_sourceCaseId_fkey" FOREIGN KEY ("sourceCaseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeArticle" ADD CONSTRAINT "KnowledgeArticle_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "CropMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KnowledgeArticleToTagMaster" ADD CONSTRAINT "_KnowledgeArticleToTagMaster_A_fkey" FOREIGN KEY ("A") REFERENCES "KnowledgeArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KnowledgeArticleToTagMaster" ADD CONSTRAINT "_KnowledgeArticleToTagMaster_B_fkey" FOREIGN KEY ("B") REFERENCES "TagMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

