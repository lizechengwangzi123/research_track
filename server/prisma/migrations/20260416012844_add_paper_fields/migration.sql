-- AlterTable
ALTER TABLE "Paper" ADD COLUMN     "authors" TEXT,
ADD COLUMN     "journalName" TEXT,
ADD COLUMN     "link" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "submittedAt" TIMESTAMP(3);
