-- CreateTable
CREATE TABLE "SavedLetter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "letterId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedLetter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SavedLetter_letterId_fkey" FOREIGN KEY ("letterId") REFERENCES "Letter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SavedLetter_userId_createdAt_idx" ON "SavedLetter"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SavedLetter_userId_letterId_key" ON "SavedLetter"("userId", "letterId");
