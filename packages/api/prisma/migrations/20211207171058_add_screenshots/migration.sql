-- CreateTable
CREATE TABLE "Screenshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "reportId" INTEGER NOT NULL,
    CONSTRAINT "Screenshot_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
