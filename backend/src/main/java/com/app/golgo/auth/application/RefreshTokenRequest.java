package com.app.golgo.auth.application;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenRequest(@NotBlank String refreshToken) {
}
