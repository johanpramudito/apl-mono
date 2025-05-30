/*
  Warnings:

  - The primary key for the `chatSession` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `pesan` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "pesan" DROP CONSTRAINT "pesan_chatSessionId_session_fkey";

-- AlterTable
ALTER TABLE "chatSession" DROP CONSTRAINT "chatSession_pkey",
ADD COLUMN     "judul" TEXT NOT NULL DEFAULT 'New Chat',
ALTER COLUMN "id_session" DROP DEFAULT,
ALTER COLUMN "id_session" SET DATA TYPE TEXT,
ADD CONSTRAINT "chatSession_pkey" PRIMARY KEY ("id_session");
DROP SEQUENCE "chatSession_id_session_seq";

-- AlterTable
ALTER TABLE "pesan" DROP CONSTRAINT "pesan_pkey",
ALTER COLUMN "id_pesan" DROP DEFAULT,
ALTER COLUMN "id_pesan" SET DATA TYPE TEXT,
ALTER COLUMN "chatSessionId_session" SET DATA TYPE TEXT,
ADD CONSTRAINT "pesan_pkey" PRIMARY KEY ("id_pesan");
DROP SEQUENCE "pesan_id_pesan_seq";

-- AddForeignKey
ALTER TABLE "pesan" ADD CONSTRAINT "pesan_chatSessionId_session_fkey" FOREIGN KEY ("chatSessionId_session") REFERENCES "chatSession"("id_session") ON DELETE SET NULL ON UPDATE CASCADE;
