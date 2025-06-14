/*
  Warnings:

  - The `status` column on the `Booking` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `content` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Product` table. All the data in the column will be lost.
  - Added the required column `mimeType` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_userId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "status",
ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "content",
DROP COLUMN "title",
ADD COLUMN     "comment" TEXT;

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "downloadCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "originalName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "userId",
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Supplier" ALTER COLUMN "address" DROP NOT NULL;

-- DropEnum
DROP TYPE "Status";
