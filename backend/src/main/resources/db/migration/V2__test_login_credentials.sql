CREATE TABLE test_login_credentials (
    login_id VARCHAR(50) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO users (email, nickname)
VALUES ('test01@golgo.local', 'test01')
ON CONFLICT (email) DO NOTHING;

INSERT INTO test_login_credentials (login_id, password_hash, user_id)
SELECT
    'test01',
    crypt('test01', gen_salt('bf', 10)),
    id
FROM users
WHERE email = 'test01@golgo.local'
ON CONFLICT (login_id) DO NOTHING;
