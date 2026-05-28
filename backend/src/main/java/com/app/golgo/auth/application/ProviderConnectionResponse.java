package com.app.golgo.auth.application;

import com.app.golgo.auth.domain.SocialProvider;
import java.time.Instant;

public record ProviderConnectionResponse(SocialProvider provider, Instant connectedAt) {
}
