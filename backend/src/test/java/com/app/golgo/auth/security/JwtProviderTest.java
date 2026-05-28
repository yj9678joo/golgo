package com.app.golgo.auth.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class JwtProviderTest {

	private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-05-28T00:00:00Z"), ZoneOffset.UTC);
	private static final String SECRET = "0123456789012345678901234567890101234567890123456789012345678901";

	@Test
	void createsAccessTokenWithUserIdSubjectAndConfiguredExpiry() {
		UUID userId = UUID.fromString("018f0000-0000-7000-8000-000000000001");
		JwtProvider jwtProvider = new JwtProvider(SECRET, 900, 604800, CLOCK);

		String token = jwtProvider.createAccessToken(userId);
		JwtPrincipal principal = jwtProvider.parse(token);

		assertThat(principal.userId()).isEqualTo(userId);
		assertThat(principal.expiresAt()).isEqualTo(Instant.parse("2026-05-28T00:15:00Z"));
	}

	@Test
	void createsRefreshTokenWithRefreshTypeClaim() {
		UUID userId = UUID.fromString("018f0000-0000-7000-8000-000000000001");
		JwtProvider jwtProvider = new JwtProvider(SECRET, 900, 604800, CLOCK);

		String token = jwtProvider.createRefreshToken(userId);
		JwtPrincipal principal = jwtProvider.parseRefreshToken(token);

		assertThat(principal.userId()).isEqualTo(userId);
		assertThat(principal.expiresAt()).isEqualTo(Instant.parse("2026-06-04T00:00:00Z"));
	}
}
