package com.app.golgo.auth.application;

import java.util.List;

public record ProviderListResponse(List<ProviderConnectionResponse> providers) {
}
