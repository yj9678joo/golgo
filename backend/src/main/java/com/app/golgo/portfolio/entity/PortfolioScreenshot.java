package com.app.golgo.portfolio.entity;

import com.app.golgo.auth.entity.User;
import com.app.golgo.broker.entity.BrokerAccount;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Generated;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.generator.EventType;
import org.hibernate.type.SqlTypes;

@Getter
@Entity
@Table(name = "portfolio_screenshots")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PortfolioScreenshot {

	@Id
	@Generated(event = EventType.INSERT)
	@Column(insertable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "broker_account_id", nullable = false)
	private BrokerAccount brokerAccount;

	@Column(name = "broker_code", nullable = false, length = 20)
	private String brokerCode;

	@Column(name = "image_path", nullable = false)
	private String imagePath;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private ScreenshotStatus status;

	@Column(precision = 4, scale = 3)
	private BigDecimal confidence;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "parsed_holdings_json", columnDefinition = "jsonb")
	private JsonNode parsedHoldingsJson;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "edited_holdings_json", columnDefinition = "jsonb")
	private JsonNode editedHoldingsJson;

	@Column(name = "is_manually_edited", nullable = false)
	private boolean manuallyEdited;

	@Column(name = "total_asset_krw", precision = 18, scale = 2)
	private BigDecimal totalAssetKrw;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "warnings_json", columnDefinition = "jsonb")
	private JsonNode warningsJson;

	@Column(name = "error_reason", length = 50)
	private String errorReason;

	@Column(name = "requested_at", nullable = false)
	private Instant requestedAt;

	@Column(name = "completed_at")
	private Instant completedAt;

	@Column(name = "confirmed_at")
	private Instant confirmedAt;

	private PortfolioScreenshot(User user, BrokerAccount brokerAccount, String imagePath, Clock clock) {
		this.user = user;
		this.brokerAccount = brokerAccount;
		this.brokerCode = brokerAccount.getBrokerCode();
		this.imagePath = imagePath;
		this.status = ScreenshotStatus.PROCESSING;
		this.manuallyEdited = false;
		this.requestedAt = Instant.now(clock);
	}

	public static PortfolioScreenshot processing(User user, BrokerAccount brokerAccount, String imagePath, Clock clock) {
		return new PortfolioScreenshot(user, brokerAccount, imagePath, clock);
	}

	public void complete(JsonNode holdingsJson, BigDecimal confidence, BigDecimal totalAssetKrw, JsonNode warningsJson, Clock clock) {
		this.status = ScreenshotStatus.COMPLETED;
		this.parsedHoldingsJson = holdingsJson;
		this.confidence = confidence;
		this.totalAssetKrw = totalAssetKrw;
		this.warningsJson = warningsJson;
		this.completedAt = Instant.now(clock);
	}

	public void fail(String errorReason, Clock clock) {
		this.status = ScreenshotStatus.FAILED;
		this.errorReason = errorReason;
		this.completedAt = Instant.now(clock);
	}

	public void updateEditedHoldings(JsonNode holdingsJson, BigDecimal totalAssetKrw) {
		this.status = ScreenshotStatus.PENDING_CONFIRM;
		this.editedHoldingsJson = holdingsJson;
		this.totalAssetKrw = totalAssetKrw;
		this.manuallyEdited = true;
	}

	public void confirm(Clock clock) {
		this.status = ScreenshotStatus.CONFIRMED;
		this.confirmedAt = Instant.now(clock);
	}

	public JsonNode currentHoldingsJson() {
		return editedHoldingsJson != null ? editedHoldingsJson : parsedHoldingsJson;
	}

	public void assignIdForTest(UUID id) {
		this.id = id;
	}
}
