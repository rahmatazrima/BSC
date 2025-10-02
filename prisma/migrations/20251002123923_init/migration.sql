-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."StatusService" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Handphone" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "kendalaHandphoneId" TEXT NOT NULL,

    CONSTRAINT "Handphone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KendalaHandphone" (
    "id" TEXT NOT NULL,
    "topikMasalah" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pergantianBarangId" TEXT NOT NULL,

    CONSTRAINT "KendalaHandphone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PergantianBarang" (
    "id" TEXT NOT NULL,
    "namaBarang" TEXT NOT NULL,
    "harga" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PergantianBarang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Waktu" (
    "id" TEXT NOT NULL,
    "namaShift" TEXT NOT NULL,
    "jamSelesai" TEXT NOT NULL,
    "jamMulai" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Waktu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Service" (
    "id" TEXT NOT NULL,
    "statusService" "public"."StatusService" NOT NULL DEFAULT 'PENDING',
    "tempat" TEXT NOT NULL,
    "tanggalPesan" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "handphoneId" TEXT NOT NULL,
    "waktuId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "KendalaHandphone_pergantianBarangId_key" ON "public"."KendalaHandphone"("pergantianBarangId");

-- AddForeignKey
ALTER TABLE "public"."Handphone" ADD CONSTRAINT "Handphone_kendalaHandphoneId_fkey" FOREIGN KEY ("kendalaHandphoneId") REFERENCES "public"."KendalaHandphone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KendalaHandphone" ADD CONSTRAINT "KendalaHandphone_pergantianBarangId_fkey" FOREIGN KEY ("pergantianBarangId") REFERENCES "public"."PergantianBarang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_handphoneId_fkey" FOREIGN KEY ("handphoneId") REFERENCES "public"."Handphone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_waktuId_fkey" FOREIGN KEY ("waktuId") REFERENCES "public"."Waktu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
