-- DropForeignKey
ALTER TABLE "public"."KendalaHandphone" DROP CONSTRAINT "KendalaHandphone_handphoneId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PergantianBarang" DROP CONSTRAINT "PergantianBarang_kendalaHandphoneId_fkey";

-- AlterTable
ALTER TABLE "PergantianBarang" ADD COLUMN     "jumlahStok" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "KendalaHandphone" ADD CONSTRAINT "KendalaHandphone_handphoneId_fkey" FOREIGN KEY ("handphoneId") REFERENCES "Handphone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PergantianBarang" ADD CONSTRAINT "PergantianBarang_kendalaHandphoneId_fkey" FOREIGN KEY ("kendalaHandphoneId") REFERENCES "KendalaHandphone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
