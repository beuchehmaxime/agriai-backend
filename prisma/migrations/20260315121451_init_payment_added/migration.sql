-- CreateEnum
CREATE TYPE "OrderPaymentMethod" AS ENUM ('MTN_MOMO', 'ORANGE_MOMO', 'CASH_ON_DELIVERY');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentMethod" "OrderPaymentMethod",
ADD COLUMN     "paymentStatus" "TransactionStatus" NOT NULL DEFAULT 'PENDING';
