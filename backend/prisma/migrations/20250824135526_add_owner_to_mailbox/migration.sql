/*
  Warnings:

  - Added the required column `ownerId` to the `Mailbox` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Mailbox" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "passwordHash" TEXT,
    "hint" TEXT,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" INTEGER NOT NULL,
    CONSTRAINT "Mailbox_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Mailbox" ("createdAt", "hint", "id", "lat", "lng", "name", "passwordHash", "type") SELECT "createdAt", "hint", "id", "lat", "lng", "name", "passwordHash", "type" FROM "Mailbox";
DROP TABLE "Mailbox";
ALTER TABLE "new_Mailbox" RENAME TO "Mailbox";
CREATE INDEX "Mailbox_lat_lng_idx" ON "Mailbox"("lat", "lng");
CREATE INDEX "Mailbox_ownerId_createdAt_idx" ON "Mailbox"("ownerId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
