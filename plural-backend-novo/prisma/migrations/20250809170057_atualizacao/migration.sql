-- CreateTable
CREATE TABLE "public"."FavoriteArgument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "argumentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteArgument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteArgument_userId_argumentId_key" ON "public"."FavoriteArgument"("userId", "argumentId");

-- AddForeignKey
ALTER TABLE "public"."FavoriteArgument" ADD CONSTRAINT "FavoriteArgument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FavoriteArgument" ADD CONSTRAINT "FavoriteArgument_argumentId_fkey" FOREIGN KEY ("argumentId") REFERENCES "public"."Argument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
