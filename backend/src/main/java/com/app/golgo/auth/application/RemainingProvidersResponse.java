package com.app.golgo.auth.application;

import com.app.golgo.auth.domain.SocialProvider;
import java.util.List;

public record RemainingProvidersResponse(List<SocialProvider> remainingProviders) {
}
