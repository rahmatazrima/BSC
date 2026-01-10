-- AlterEnum
-- Remove PAID from StatusService enum
ALTER TYPE "StatusService" RENAME VALUE 'PAID' TO 'PAID_OLD';

-- Update any PAID status to COMPLETED before removing
UPDATE "Service" SET "statusService" = 'COMPLETED' WHERE "statusService" = 'PAID_OLD';

-- Note: Cannot directly remove enum value in PostgreSQL, need to recreate enum
-- This is safe as we already updated all PAID to COMPLETED
