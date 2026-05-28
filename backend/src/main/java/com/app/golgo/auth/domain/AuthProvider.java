package com.app.golgo.auth.domain;

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
@Table(name = "auth_providers")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AuthProvider {

	@Id
	@Generated(event = EventType.INSERT)
	@Column(insertable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private SocialProvider provider;

	@Column(name = "provider_id", nullable = false)
	private String providerId;

	@Column(name = "connected_at", nullable = false)
	private Instant connectedAt;

	private AuthProvider(User user, SocialProvider provider, String providerId, Clock clock) {
		this.user = user;
		this.provider = provider;
		this.providerId = providerId;
		this.connectedAt = Instant.now(clock);
	}

	public static AuthProvider connect(User user, SocialProvider provider, String providerId, Clock clock) {
		return new AuthProvider(user, provider, providerId, clock);
	}
}
