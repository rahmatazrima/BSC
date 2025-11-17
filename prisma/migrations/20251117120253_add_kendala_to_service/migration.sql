-- CreateTable
CREATE TABLE "_KendalaHandphoneToService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_KendalaHandphoneToService_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_KendalaHandphoneToService_B_index" ON "_KendalaHandphoneToService"("B");

-- AddForeignKey
ALTER TABLE "_KendalaHandphoneToService" ADD CONSTRAINT "_KendalaHandphoneToService_A_fkey" FOREIGN KEY ("A") REFERENCES "KendalaHandphone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KendalaHandphoneToService" ADD CONSTRAINT "_KendalaHandphoneToService_B_fkey" FOREIGN KEY ("B") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
