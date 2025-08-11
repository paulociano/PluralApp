-- CreateTable
CREATE TABLE "public"."FallacyType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "FallacyType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrainingExercise" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "correctFallacyId" TEXT NOT NULL,

    CONSTRAINT "TrainingExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FallacyType_name_key" ON "public"."FallacyType"("name");

-- AddForeignKey
ALTER TABLE "public"."TrainingExercise" ADD CONSTRAINT "TrainingExercise_correctFallacyId_fkey" FOREIGN KEY ("correctFallacyId") REFERENCES "public"."FallacyType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
