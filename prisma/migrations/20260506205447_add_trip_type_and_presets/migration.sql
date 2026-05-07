-- CreateEnum
CREATE TYPE "TripType" AS ENUM ('BEACH', 'CITY', 'BUSINESS', 'SKI', 'HIKING', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "destination" TEXT,
    "tripType" "TripType" NOT NULL DEFAULT 'OTHER',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_categories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT DEFAULT '#3B82F6',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_templates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packing_list_items" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "categoryId" TEXT,
    "templateId" TEXT,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "packed" BOOLEAN NOT NULL DEFAULT false,
    "broughtBack" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packing_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_presets" (
    "id" TEXT NOT NULL,
    "tripType" "TripType" NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "perDay" BOOLEAN NOT NULL DEFAULT false,
    "baseQuantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "trip_presets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "trips_userId_idx" ON "trips"("userId");

-- CreateIndex
CREATE INDEX "item_categories_userId_idx" ON "item_categories"("userId");

-- CreateIndex
CREATE INDEX "item_templates_userId_idx" ON "item_templates"("userId");

-- CreateIndex
CREATE INDEX "item_templates_categoryId_idx" ON "item_templates"("categoryId");

-- CreateIndex
CREATE INDEX "packing_list_items_tripId_idx" ON "packing_list_items"("tripId");

-- CreateIndex
CREATE INDEX "packing_list_items_categoryId_idx" ON "packing_list_items"("categoryId");

-- CreateIndex
CREATE INDEX "packing_list_items_templateId_idx" ON "packing_list_items"("templateId");

-- CreateIndex
CREATE INDEX "trip_presets_tripType_idx" ON "trip_presets"("tripType");

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_categories" ADD CONSTRAINT "item_categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_templates" ADD CONSTRAINT "item_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_templates" ADD CONSTRAINT "item_templates_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "item_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packing_list_items" ADD CONSTRAINT "packing_list_items_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packing_list_items" ADD CONSTRAINT "packing_list_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "item_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packing_list_items" ADD CONSTRAINT "packing_list_items_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "item_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
