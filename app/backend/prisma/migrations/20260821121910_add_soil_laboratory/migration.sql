-- CreateEnum
CREATE TYPE "SoilSampleStatus" AS ENUM ('CREATED', 'DISPATCHED', 'RECEIVED', 'TESTED', 'REPORT_AVAILABLE');

-- CreateTable
CREATE TABLE "SoilSample" (
    "id" TEXT NOT NULL,
    "sampleCode" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "farmLandId" TEXT NOT NULL,
    "caseId" TEXT,
    "collectionVideoWatched" BOOLEAN NOT NULL DEFAULT false,
    "status" "SoilSampleStatus" NOT NULL DEFAULT 'CREATED',
    "dispatchedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "testedAt" TIMESTAMP(3),
    "reportUrl" TEXT,
    "reportAvailableAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoilSample_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SoilSample_sampleCode_key" ON "SoilSample"("sampleCode");

-- CreateIndex
CREATE INDEX "SoilSample_farmerId_idx" ON "SoilSample"("farmerId");

-- CreateIndex
CREATE INDEX "SoilSample_status_idx" ON "SoilSample"("status");

-- AddForeignKey
ALTER TABLE "SoilSample" ADD CONSTRAINT "SoilSample_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoilSample" ADD CONSTRAINT "SoilSample_farmLandId_fkey" FOREIGN KEY ("farmLandId") REFERENCES "FarmLand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoilSample" ADD CONSTRAINT "SoilSample_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;

