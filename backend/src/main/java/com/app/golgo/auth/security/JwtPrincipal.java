package com.app.golgo.auth.security;

import java.time.Instant;
import java.util.UUID;

public record JwtPrincipal(UUID userId, Instant expiresAt) {
}
