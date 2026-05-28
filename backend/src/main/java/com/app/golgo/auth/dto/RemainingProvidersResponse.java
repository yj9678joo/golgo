package com.app.golgo.auth.dto;

import com.app.golgo.auth.entity.SocialProvider;
import java.util.List;

public record RemainingProvidersResponse(List<SocialProvider> remainingProviders) {
}
