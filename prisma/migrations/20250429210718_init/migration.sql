-- CreateTable
CREATE TABLE "pesan" (
    "id_pesan" SERIAL NOT NULL,
    "isi_pesan" TEXT NOT NULL,
    "peran" VARCHAR(20) NOT NULL,
    "waktu_buat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_pengguna" INTEGER NOT NULL,

    CONSTRAINT "pesan_pkey" PRIMARY KEY ("id_pesan")
);

-- AddForeignKey
ALTER TABLE "pesan" ADD CONSTRAINT "pesan_id_pengguna_fkey" FOREIGN KEY ("id_pengguna") REFERENCES "akun_pengguna"("id_pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;
