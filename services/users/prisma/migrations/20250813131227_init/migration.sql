-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "mail" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OFFLINE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profile_url" TEXT,
    "preferences" JSONB
);
INSERT INTO "new_users" ("created_at", "id", "mail", "preferences", "profile_url", "username") SELECT "created_at", "id", "mail", "preferences", "profile_url", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
