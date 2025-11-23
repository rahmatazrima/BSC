-- AlterTable
-- Menambahkan kolom alamat pada tabel Service
-- Kolom ini bersifat nullable (boleh kosong) untuk menyimpan Alamat Lengkap pelanggan/user
-- yang diisi saat memesan servis. Field ini opsional dan dapat dikosongkan.
ALTER TABLE "public"."Service" ADD COLUMN "alamat" TEXT;


