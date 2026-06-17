package com.app.golgo.broker.entity;

import com.app.golgo.auth.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "broker_accounts")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BrokerAccount {

	@Id
	@Generated(event = EventType.INSERT)
	@Column(insertable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(name = "broker_code", nullable = false, length = 20)
	private String brokerCode;

	@Enumerated(EnumType.STRING)
	@Column(name = "connection_type", nullable = false, length = 20)
	private BrokerConnectionType connectionType;

	@Column(name = "account_number", length = 50)
	private String accountNumber;

	@Column(name = "account_nickname", length = 50)
	private String accountNickname;

	@Column(name = "app_key_enc")
	private String appKeyEnc;

	@Column(name = "app_secret_enc")
	private String appSecretEnc;

	@Column(name = "access_token_enc")
	private String accessTokenEnc;

	@Column(name = "token_expires_at")
	private Instant tokenExpiresAt;

	@Column(name = "last_synced_at")
	private Instant lastSyncedAt;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	@Column(name = "deleted_at")
	private Instant deletedAt;

	private BrokerAccount(User user, String brokerCode, String accountNickname, Clock clock) {
		this.user = user;
		this.brokerCode = brokerCode;
		this.connectionType = BrokerConnectionType.SCREENSHOT;
		this.accountNickname = accountNickname;
		this.createdAt = Instant.now(clock);
		this.updatedAt = this.createdAt;
	}

	public static BrokerAccount createScreenshot(User user, String brokerCode, String accountNickname, Clock clock) {
		return new BrokerAccount(user, brokerCode, accountNickname, clock);
	}

	public void touchLastSyncedAt(Clock clock) {
		this.lastSyncedAt = Instant.now(clock);
		this.updatedAt = this.lastSyncedAt;
	}

	public void assignIdForTest(UUID id) {
		this.id = id;
	}
}
