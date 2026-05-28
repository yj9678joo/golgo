package com.app.golgo.auth.dto;

import java.util.List;

public record ProviderListResponse(List<ProviderConnectionResponse> providers) {
}
