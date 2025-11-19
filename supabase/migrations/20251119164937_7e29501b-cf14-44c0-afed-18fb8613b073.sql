-- Remove investment type from existing transactions
UPDATE transactions 
SET type = 'expense' 
WHERE type = 'investment';

-- Add comment explaining the change
COMMENT ON COLUMN transactions.type IS 'Transaction type: income or expense only';