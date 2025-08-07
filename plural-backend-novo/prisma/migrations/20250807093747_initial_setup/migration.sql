-- CreateEnum
CREATE TYPE "public"."ArgType" AS ENUM ('PRO', 'CONTRA');

-- CreateEnum
CREATE TYPE "public"."VoteType" AS ENUM ('UPVOTE', 'DOWNVOTE');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Topic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Argument" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "public"."ArgType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "votesCount" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "parentArgumentId" TEXT,

    CONSTRAINT "Argument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Vote" (
    "id" TEXT NOT NULL,
    "type" "public"."VoteType" NOT NULL,
    "userId" TEXT NOT NULL,
    "argumentId" TEXT NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_userId_argumentId_key" ON "public"."Vote"("userId", "argumentId");

-- AddForeignKey
ALTER TABLE "public"."Argument" ADD CONSTRAINT "Argument_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Argument" ADD CONSTRAINT "Argument_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Argument" ADD CONSTRAINT "Argument_parentArgumentId_fkey" FOREIGN KEY ("parentArgumentId") REFERENCES "public"."Argument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vote" ADD CONSTRAINT "Vote_argumentId_fkey" FOREIGN KEY ("argumentId") REFERENCES "public"."Argument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
