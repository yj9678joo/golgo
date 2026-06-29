CREATE TABLE analysis_reports (
    id UUID PRIMARY KEY DEFAULT uuid_v7(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticker VARCHAR(20) NOT NULL,
    analysis_type VARCHAR(20) NOT NULL,
    llm_provider VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    progress_pct SMALLINT DEFAULT 0,
    current_step VARCHAR(30),
    investment_thesis TEXT,
    overall_score DECIMAL(4,2),
    recommendation VARCHAR(20),
    error_message TEXT,
    requested_at TIMESTAMPTZ NOT NULL,
    generated_at TIMESTAMPTZ
);

CREATE INDEX idx_analysis_reports_user_ticker
    ON analysis_reports(user_id, ticker, requested_at DESC);

CREATE INDEX idx_analysis_reports_status
    ON analysis_reports(status);

CREATE TABLE report_sections (
    id UUID PRIMARY KEY DEFAULT uuid_v7(),
    report_id UUID NOT NULL REFERENCES analysis_reports(id) ON DELETE CASCADE,
    section_code VARCHAR(30) NOT NULL,
    section_order SMALLINT NOT NULL,
    content_json JSONB NOT NULL,
    score SMALLINT,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uk_report_sections_report_code UNIQUE (report_id, section_code)
);
