-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "standardPokeball" INTEGER NOT NULL DEFAULT 0,
    "greatPokeball" INTEGER NOT NULL DEFAULT 0,
    "ultraPokeball" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_id_key" ON "Inventory"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_userId_key" ON "Inventory"("userId");

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
