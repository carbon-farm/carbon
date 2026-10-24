-- CreateTable
CREATE TABLE "SeasonalTip" (
    "id" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleTe" TEXT NOT NULL,
    "bodyEn" TEXT NOT NULL,
    "bodyTe" TEXT NOT NULL,
    "startMonth" INTEGER NOT NULL,
    "endMonth" INTEGER NOT NULL,
    "cropId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeasonalTip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SeasonalTip_isActive_idx" ON "SeasonalTip"("isActive");

-- AddForeignKey
ALTER TABLE "SeasonalTip" ADD CONSTRAINT "SeasonalTip_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "CropMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
