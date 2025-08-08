/*
  Warnings:

  - Added the required column `category` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."TopicCategory" AS ENUM ('TECNOLOGIA', 'SOCIEDADE', 'CULTURA', 'POLITICA', 'MEIO_AMBIENTE', 'CIENCIA', 'OUTRO');

-- AlterTable
ALTER TABLE "public"."Topic" ADD COLUMN     "category" "public"."TopicCategory" NOT NULL;
