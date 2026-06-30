ALTER TABLE analysis_reports
    ADD COLUMN asset_type VARCHAR(20) NOT NULL DEFAULT 'STOCK';

ALTER TABLE analysis_reports
    ALTER COLUMN asset_type DROP DEFAULT;

ALTER TABLE analysis_reports
    ADD CONSTRAINT chk_analysis_reports_asset_type
        CHECK (asset_type IN ('STOCK', 'ETF'));
