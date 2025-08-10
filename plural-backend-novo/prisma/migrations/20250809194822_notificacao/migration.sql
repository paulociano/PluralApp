-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_originArgumentId_fkey" FOREIGN KEY ("originArgumentId") REFERENCES "public"."Argument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
