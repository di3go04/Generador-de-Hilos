/*
  Warnings:

  - You are about to drop the `admin_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `api_keys` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `folders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `scheduled_posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `threads` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `twitter_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `source` on the `newsletter_leads` table. All the data in the column will be lost.
  - You are about to drop the column `cancelAtPeriodEnd` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCurrentPeriodEnd` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `metric` on the `usage_records` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `usage_records` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `usage_records` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `usage_records` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `users` table. All the data in the column will be lost.
  - Added the required column `toolSlug` to the `usage_records` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "api_keys_key_key";

-- DropIndex
DROP INDEX "scheduled_posts_threadId_key";

-- DropIndex
DROP INDEX "twitter_tokens_userId_key";

-- DropIndex
DROP INDEX "verification_tokens_identifier_token_key";

-- DropIndex
DROP INDEX "verification_tokens_token_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "admin_logs";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "api_keys";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "folders";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "scheduled_posts";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "threads";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "twitter_tokens";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "verification_tokens";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_newsletter_leads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_newsletter_leads" ("createdAt", "email", "id") SELECT "createdAt", "email", "id" FROM "newsletter_leads";
DROP TABLE "newsletter_leads";
ALTER TABLE "new_newsletter_leads" RENAME TO "newsletter_leads";
CREATE UNIQUE INDEX "newsletter_leads_email_key" ON "newsletter_leads"("email");
CREATE TABLE "new_subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_subscriptions" ("createdAt", "id", "updatedAt", "userId") SELECT "createdAt", "id", "updatedAt", "userId" FROM "subscriptions";
DROP TABLE "subscriptions";
ALTER TABLE "new_subscriptions" RENAME TO "subscriptions";
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");
CREATE TABLE "new_usage_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "toolSlug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "usage_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_usage_records" ("createdAt", "id", "userId") SELECT "createdAt", "id", "userId" FROM "usage_records";
DROP TABLE "usage_records";
ALTER TABLE "new_usage_records" RENAME TO "usage_records";
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("banned", "createdAt", "email", "emailVerified", "id", "image", "name", "password", "plan", "role", "updatedAt") SELECT "banned", "createdAt", "email", "emailVerified", "id", "image", "name", "password", "plan", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
