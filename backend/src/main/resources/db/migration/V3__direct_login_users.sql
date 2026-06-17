ALTER TABLE users ADD COLUMN IF NOT EXISTS login_id VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(50);

UPDATE users
SET
    login_id = COALESCE(login_id, split_part(email, '@', 1)),
    password_hash = COALESCE(password_hash, '$2a$10$hMyP/eGrIGtc1GhJoeJ5FuhxyJwGgQlof7LSBHxGGKOmr2wURaXEe'),
    name = COALESCE(name, nickname)
WHERE login_id IS NULL OR password_hash IS NULL OR name IS NULL;

ALTER TABLE users ALTER COLUMN login_id SET NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
ALTER TABLE users ALTER COLUMN name SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_login_id ON users (login_id);
