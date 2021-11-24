/*
  Warnings:

  - Added the required column `data` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Report" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT NOT NULL,
    "data" TEXT NOT NULL
);
INSERT INTO "new_Report" ("createdAt", "id", "url") SELECT "createdAt", "id", "url" FROM "Report";
DROP TABLE "Report";
ALTER TABLE "new_Report" RENAME TO "Report";
CREATE UNIQUE INDEX "Report_url_key" ON "Report"("url");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
