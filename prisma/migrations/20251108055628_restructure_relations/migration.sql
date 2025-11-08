/*
  Warnings:

  - You are about to drop the column `kendalaHandphoneId` on the `Handphone` table. All the data in the column will be lost.
  - You are about to drop the column `pergantianBarangId` on the `KendalaHandphone` table. All the data in the column will be lost.
  - Added the required column `handphoneId` to the `KendalaHandphone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kendalaHandphoneId` to the `PergantianBarang` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Handphone" DROP CONSTRAINT "Handphone_kendalaHandphoneId_fkey";

-- DropForeignKey
ALTER TABLE "public"."KendalaHandphone" DROP CONSTRAINT "KendalaHandphone_pergantianBarangId_fkey";

-- DropIndex
DROP INDEX "public"."KendalaHandphone_pergantianBarangId_key";

-- AlterTable
ALTER TABLE "Handphone" DROP COLUMN "kendalaHandphoneId";

-- AlterTable
ALTER TABLE "KendalaHandphone" DROP COLUMN "pergantianBarangId",
ADD COLUMN     "handphoneId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PergantianBarang" ADD COLUMN     "kendalaHandphoneId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "KendalaHandphone" ADD CONSTRAINT "KendalaHandphone_handphoneId_fkey" FOREIGN KEY ("handphoneId") REFERENCES "Handphone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PergantianBarang" ADD CONSTRAINT "PergantianBarang_kendalaHandphoneId_fkey" FOREIGN KEY ("kendalaHandphoneId") REFERENCES "KendalaHandphone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
