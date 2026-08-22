-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Odoo India',
ADD COLUMN     "joinedYear" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "EmpIdCounter" (
    "year" INTEGER NOT NULL,
    "lastSerial" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EmpIdCounter_pkey" PRIMARY KEY ("year")
);
