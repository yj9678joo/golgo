package com.app.golgo.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;

public class JwtProvider {

	private static final String TOKEN_TYPE = "typ";
	private static final String ACCESS = "access";
	private static final String REFRESH = "refresh";

	private final SecretKey secretKey;
	private final long accessTokenValiditySeconds;
	private final long refreshTokenValiditySeconds;
	private final Clock clock;

	public JwtProvider(String secret, long accessTokenValiditySeconds, long refreshTokenValiditySeconds, Clock clock) {
		this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
		this.accessTokenValiditySeconds = accessTokenValiditySeconds;
		this.refreshTokenValiditySeconds = refreshTokenValiditySeconds;
		this.clock = clock;
	}

	public String createAccessToken(UUID userId) {
		return createToken(userId, ACCESS, accessTokenValiditySeconds);
	}

	public String createRefreshToken(UUID userId) {
		return createToken(userId, REFRESH, refreshTokenValiditySeconds);
	}

	public JwtPrincipal parse(String token) {
		return parseWithType(token, ACCESS);
	}

	public JwtPrincipal parseRefreshToken(String token) {
		return parseWithType(token, REFRESH);
	}

	public long accessTokenValiditySeconds() {
		return accessTokenValiditySeconds;
	}

	private String createToken(UUID userId, String type, long validitySeconds) {
		Instant issuedAt = Instant.now(clock);
		Instant expiresAt = issuedAt.plusSeconds(validitySeconds);
		return Jwts.builder()
			.subject(userId.toString())
			.claim(TOKEN_TYPE, type)
			.issuedAt(Date.from(issuedAt))
			.expiration(Date.from(expiresAt))
			.signWith(secretKey)
			.compact();
	}

	private JwtPrincipal parseWithType(String token, String expectedType) {
		Claims claims = Jwts.parser()
			.verifyWith(secretKey)
			.clock(() -> Date.from(Instant.now(clock)))
			.build()
			.parseSignedClaims(token)
			.getPayload();
		if (!expectedType.equals(claims.get(TOKEN_TYPE, String.class))) {
			throw new IllegalArgumentException("Invalid token type");
		}
		return new JwtPrincipal(UUID.fromString(claims.getSubject()), claims.getExpiration().toInstant());
	}
}
