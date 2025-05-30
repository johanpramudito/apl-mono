-- CreateTable
CREATE TABLE "akun_pengguna" (
    "id_pengguna" SERIAL NOT NULL,
    "username" VARCHAR(50),
    "email" VARCHAR(100),
    "password" VARCHAR(255) NOT NULL,

    CONSTRAINT "akun_pengguna_pkey" PRIMARY KEY ("id_pengguna")
);

-- CreateIndex
CREATE UNIQUE INDEX "akun_pengguna_email_key" ON "akun_pengguna"("email");
