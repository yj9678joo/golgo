package com.app.golgo.portfolio.entity;

import com.app.golgo.broker.entity.BrokerAccount;
import com.app.golgo.portfolio.dto.HoldingPayload;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Clock;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

@Getter
@Entity
@Table(name = "holdings")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Holding {

	@Id
	@Generated(event = EventType.INSERT)
	@Column(insertable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "broker_account_id", nullable = false)
	private BrokerAccount brokerAccount;

	@Column(nullable = false, length = 20)
	private String ticker;

	@Column(nullable = false, length = 100)
	private String name;

	@Column(nullable = false, length = 20)
	private String market;

	@Column(nullable = false, precision = 18, scale = 4)
	private java.math.BigDecimal quantity;

	@Column(name = "avg_price", nullable = false, precision = 18, scale = 4)
	private java.math.BigDecimal avgPrice;

	@Column(name = "current_price", precision = 18, scale = 4)
	private java.math.BigDecimal currentPrice;

	@Column(nullable = false, length = 3)
	private String currency;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	private Holding(BrokerAccount brokerAccount, HoldingPayload payload, Clock clock) {
		this.brokerAccount = brokerAccount;
		this.ticker = payload.ticker();
		this.name = payload.name();
		this.market = payload.market();
		this.quantity = payload.quantity();
		this.avgPrice = payload.avgPrice();
		this.currentPrice = payload.currentPrice();
		this.currency = payload.currency();
		this.updatedAt = Instant.now(clock);
	}

	public static Holding create(BrokerAccount brokerAccount, HoldingPayload payload, Clock clock) {
		return new Holding(brokerAccount, payload, clock);
	}
}
