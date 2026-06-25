ALTER TABLE holdings ADD COLUMN current_value_krw NUMERIC(20, 2);

UPDATE holdings
SET current_value_krw = quantity * COALESCE(current_price, 0);

ALTER TABLE holdings ALTER COLUMN current_value_krw SET NOT NULL;
