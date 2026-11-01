-- AlterTable: add the column nullable first so existing users can be backfilled.
ALTER TABLE "users" ADD COLUMN "passwordHash" TEXT;

-- Existing data (single "default-user" account) gets a temporary password,
-- to be changed from the /account page after the first login.
UPDATE "users"
SET "passwordHash" = '039d02f08f49c1465116ba0f5aa35da8:d2b24fe42afe2ffe01a1f39f508de8f59e30cef04b73ab64ffce101f83ec4680493729e068a7e8e933bbe71cd96d7de8ac234c8863322bc0071e5911ea1e71ee'
WHERE "passwordHash" IS NULL;

ALTER TABLE "users" ALTER COLUMN "passwordHash" SET NOT NULL;

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
