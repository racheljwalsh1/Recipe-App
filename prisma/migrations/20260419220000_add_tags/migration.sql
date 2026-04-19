-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT '{}';
