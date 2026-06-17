CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION uuid_v7()
RETURNS UUID
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
    unix_ts_ms BIGINT := FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000);
    ts_hex TEXT := LPAD(TO_HEX(unix_ts_ms), 12, '0');
    rand_hex TEXT := ENCODE(gen_random_bytes(10), 'hex');
    variant_hex TEXT := SUBSTRING('89ab' FROM (get_byte(gen_random_bytes(1), 0) % 4) + 1 FOR 1);
BEGIN
    RETURN (
        SUBSTRING(ts_hex FROM 1 FOR 8) || '-' ||
        SUBSTRING(ts_hex FROM 9 FOR 4) || '-' ||
        '7' || SUBSTRING(rand_hex FROM 1 FOR 3) || '-' ||
        variant_hex || SUBSTRING(rand_hex FROM 4 FOR 3) || '-' ||
        SUBSTRING(rand_hex FROM 7 FOR 12)
    )::UUID;
END;
$$;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_v7(),
    login_id VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    nickname VARCHAR(12) NOT NULL UNIQUE,
    profile_image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_login_id ON users (login_id);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_nickname ON users (nickname);

CREATE TABLE auth_providers (
    id UUID PRIMARY KEY DEFAULT uuid_v7(),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_auth_providers_provider_provider_id UNIQUE (provider, provider_id),
    CONSTRAINT uq_auth_providers_user_provider UNIQUE (user_id, provider)
);

CREATE INDEX idx_auth_providers_user ON auth_providers (user_id);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_v7(),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens (expires_at);

CREATE TABLE broker_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_v7(),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    broker_code VARCHAR(20) NOT NULL,
    connection_type VARCHAR(20) NOT NULL,
    account_number VARCHAR(50),
    account_nickname VARCHAR(50),
    app_key_enc TEXT,
    app_secret_enc TEXT,
    access_token_enc TEXT,
    token_expires_at TIMESTAMPTZ,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_broker_accounts_connection_type
        CHECK (connection_type IN ('API_KEY', 'SCREENSHOT')),
    CONSTRAINT chk_broker_accounts_api_key_account_number
        CHECK (connection_type = 'SCREENSHOT' OR account_number IS NOT NULL),
    CONSTRAINT chk_broker_accounts_api_key_app_key
        CHECK (connection_type = 'SCREENSHOT' OR app_key_enc IS NOT NULL)
);

CREATE INDEX idx_broker_accounts_user ON broker_accounts (user_id);
CREATE INDEX idx_broker_accounts_user_broker ON broker_accounts (user_id, broker_code);

CREATE TABLE holdings (
    id UUID PRIMARY KEY DEFAULT uuid_v7(),
    broker_account_id UUID NOT NULL REFERENCES broker_accounts (id) ON DELETE CASCADE,
    ticker VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    market VARCHAR(20) NOT NULL,
    quantity DECIMAL(18,4) NOT NULL,
    avg_price DECIMAL(18,4) NOT NULL,
    current_price DECIMAL(18,4),
    currency VARCHAR(3) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_holdings_broker_account_ticker UNIQUE (broker_account_id, ticker)
);

CREATE INDEX idx_holdings_broker_account ON holdings (broker_account_id);

CREATE TABLE portfolio_screenshots (
    id UUID PRIMARY KEY DEFAULT uuid_v7(),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    broker_account_id UUID NOT NULL REFERENCES broker_accounts (id) ON DELETE CASCADE,
    broker_code VARCHAR(20) NOT NULL,
    image_path TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    confidence DECIMAL(4,3),
    parsed_holdings_json JSONB,
    edited_holdings_json JSONB,
    is_manually_edited BOOLEAN NOT NULL DEFAULT FALSE,
    total_asset_krw DECIMAL(18,2),
    warnings_json JSONB,
    error_reason VARCHAR(50),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    CONSTRAINT chk_portfolio_screenshots_status
        CHECK (status IN ('PROCESSING', 'COMPLETED', 'PENDING_CONFIRM', 'CONFIRMED', 'FAILED')),
    CONSTRAINT chk_portfolio_screenshots_confidence
        CHECK (confidence IS NULL OR confidence BETWEEN 0.000 AND 1.000)
);

CREATE INDEX idx_portfolio_screenshots_user
    ON portfolio_screenshots (user_id, requested_at DESC);

CREATE INDEX idx_portfolio_screenshots_status
    ON portfolio_screenshots (status)
    WHERE status = 'PROCESSING';
