/*
  Warnings:

  - You are about to drop the column `profileComplete` on the `professionals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "professionals" DROP COLUMN "profileComplete",
ALTER COLUMN "service_type" DROP NOT NULL;
