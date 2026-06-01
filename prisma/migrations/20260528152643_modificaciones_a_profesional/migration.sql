/*
  Warnings:

  - You are about to drop the column `full_name` on the `professionals` table. All the data in the column will be lost.
  - You are about to drop the column `is_available` on the `professionals` table. All the data in the column will be lost.
  - You are about to drop the `availabilities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `job_assignments` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `first_name` to the `professionals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `professionals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone_number` to the `professionals` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ONLINE', 'BUSY', 'OFFLINE');

-- DropForeignKey
ALTER TABLE "availabilities" DROP CONSTRAINT "availabilities_professional_id_fkey";

-- DropForeignKey
ALTER TABLE "job_assignments" DROP CONSTRAINT "job_assignments_professional_id_fkey";

-- AlterTable
ALTER TABLE "professionals" DROP COLUMN "full_name",
DROP COLUMN "is_available",
ADD COLUMN     "active_job_id" TEXT,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "phone_number" TEXT NOT NULL,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'OFFLINE',
ALTER COLUMN "rating" SET DEFAULT -1.0;

-- DropTable
DROP TABLE "availabilities";

-- DropTable
DROP TABLE "job_assignments";
