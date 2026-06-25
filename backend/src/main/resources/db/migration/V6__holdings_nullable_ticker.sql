UPDATE holdings
SET ticker = NULL
WHERE ticker = '';

ALTER TABLE holdings ALTER COLUMN ticker DROP NOT NULL;
