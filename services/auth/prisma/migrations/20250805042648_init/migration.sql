/*
  Warnings:

  - You are about to drop the column `totp_secret` on the `users` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pasword_hash" TEXT,
    "totp_encerypted_secret" TEXT,
    "twofa_enable" BOOLEAN NOT NULL DEFAULT false,
    "google_id" TEXT,
    "profile_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_users" ("created_at", "email", "google_id", "id", "pasword_hash", "profile_url", "username") SELECT "created_at", "email", "google_id", "id", "pasword_hash", "profile_url", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_totp_encerypted_secret_key" ON "users"("totp_encerypted_secret");
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
