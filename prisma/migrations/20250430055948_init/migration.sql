/*
  Warnings:

  - You are about to drop the `Chat` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "pesan" ADD COLUMN     "chatSessionId_session" INTEGER;

-- DropTable
DROP TABLE "Chat";

-- CreateTable
CREATE TABLE "chatSession" (
    "id_session" SERIAL NOT NULL,
    "session_id" TEXT NOT NULL,
    "id_pengguna" INTEGER NOT NULL,
    "waktu_buat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chatSession_pkey" PRIMARY KEY ("id_session")
);

-- CreateIndex
CREATE UNIQUE INDEX "chatSession_session_id_key" ON "chatSession"("session_id");

-- AddForeignKey
ALTER TABLE "pesan" ADD CONSTRAINT "pesan_chatSessionId_session_fkey" FOREIGN KEY ("chatSessionId_session") REFERENCES "chatSession"("id_session") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatSession" ADD CONSTRAINT "chatSession_id_pengguna_fkey" FOREIGN KEY ("id_pengguna") REFERENCES "akun_pengguna"("id_pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;
