-- CreateEnum
CREATE TYPE "TesterFeedbackKind" AS ENUM ('BUG', 'REQUIREMENT', 'FEEDBACK', 'QUESTION');

-- CreateEnum
CREATE TYPE "TesterFeedbackStatus" AS ENUM ('NEW', 'SEEN', 'IN_PROGRESS', 'DONE', 'WONT_DO');

-- CreateTable
CREATE TABLE "TesterFeedback" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "kind" "TesterFeedbackKind" NOT NULL,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "expected" TEXT,
    "authorName" TEXT NOT NULL,
    "status" "TesterFeedbackStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TesterFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TesterFeedbackComment" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TesterFeedbackComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TesterAccess" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "rotatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TesterAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TesterFeedback_number_key" ON "TesterFeedback"("number");

-- CreateIndex
CREATE INDEX "TesterFeedback_status_idx" ON "TesterFeedback"("status");

-- CreateIndex
CREATE INDEX "TesterFeedback_createdAt_idx" ON "TesterFeedback"("createdAt");

-- CreateIndex
CREATE INDEX "TesterFeedbackComment_feedbackId_idx" ON "TesterFeedbackComment"("feedbackId");

-- CreateIndex
CREATE UNIQUE INDEX "TesterAccess_key_key" ON "TesterAccess"("key");

-- AddForeignKey
ALTER TABLE "TesterFeedbackComment" ADD CONSTRAINT "TesterFeedbackComment_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "TesterFeedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

