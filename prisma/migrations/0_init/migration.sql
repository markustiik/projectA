-- CreateTable
CREATE TABLE "Conversion" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "amount" DOUBLE PRECISION NOT NULL,
    "fromCurrency" TEXT NOT NULL,
    "toCurrency" TEXT NOT NULL,
    "result" DOUBLE PRECISION NOT NULL,
    "exchangeRate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
