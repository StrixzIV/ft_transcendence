/*
  Warnings:

  - The primary key for the `refresh_token` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `refresh_token` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_refresh_token" (
    "token_hash" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "replaced_by_id" TEXT,
    CONSTRAINT "refresh_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "refresh_token_replaced_by_id_fkey" FOREIGN KEY ("replaced_by_id") REFERENCES "refresh_token" ("token_hash") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_refresh_token" ("created_at", "expires_at", "replaced_by_id", "revoked", "token_hash", "user_id") SELECT "created_at", "expires_at", "replaced_by_id", "revoked", "token_hash", "user_id" FROM "refresh_token";
DROP TABLE "refresh_token";
ALTER TABLE "new_refresh_token" RENAME TO "refresh_token";
CREATE UNIQUE INDEX "refresh_token_replaced_by_id_key" ON "refresh_token"("replaced_by_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
