package com.app.golgo.auth.dto;

import com.app.golgo.auth.entity.SocialProvider;
import java.time.Instant;

public record ProviderConnectionResponse(SocialProvider provider, Instant connectedAt) {
}
