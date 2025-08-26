/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `loginId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Letter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mailboxId" INTEGER NOT NULL,
    "authorId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Letter_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "Mailbox" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Letter_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Letter" ("authorId", "content", "createdAt", "id", "mailboxId", "title") SELECT "authorId", "content", "createdAt", "id", "mailboxId", "title" FROM "Letter";
DROP TABLE "Letter";
ALTER TABLE "new_Letter" RENAME TO "Letter";
CREATE INDEX "Letter_mailboxId_createdAt_idx" ON "Letter"("mailboxId", "createdAt");
CREATE TABLE "new_Mailbox" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "passwordHash" TEXT,
    "hint" TEXT,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT,
    CONSTRAINT "Mailbox_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Mailbox" ("createdAt", "hint", "id", "lat", "lng", "name", "ownerId", "passwordHash", "type") SELECT "createdAt", "hint", "id", "lat", "lng", "name", "ownerId", "passwordHash", "type" FROM "Mailbox";
DROP TABLE "Mailbox";
ALTER TABLE "new_Mailbox" RENAME TO "Mailbox";
CREATE INDEX "Mailbox_lat_lng_idx" ON "Mailbox"("lat", "lng");
CREATE INDEX "Mailbox_ownerId_createdAt_idx" ON "Mailbox"("ownerId", "createdAt");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loginId" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password") SELECT "createdAt", "email", "id", "name", "password" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_loginId_key" ON "User"("loginId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
