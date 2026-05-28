package com.app.golgo.auth.security;

import java.time.Clock;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JwtConfig {

	@Bean
	Clock clock() {
		return Clock.systemUTC();
	}

	@Bean
	JwtProvider jwtProvider(
		@Value("${golgo.jwt.secret}") String secret,
		@Value("${golgo.jwt.access-token-validity-seconds}") long accessTokenValiditySeconds,
		@Value("${golgo.jwt.refresh-token-validity-seconds}") long refreshTokenValiditySeconds,
		Clock clock
	) {
		if (secret == null || secret.length() < 32) {
			throw new IllegalStateException("JWT_SECRET must be at least 32 characters.");
		}
		return new JwtProvider(secret, accessTokenValiditySeconds, refreshTokenValiditySeconds, clock);
	}
}
