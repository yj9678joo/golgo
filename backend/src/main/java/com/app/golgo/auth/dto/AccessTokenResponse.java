package com.app.golgo.auth.dto;

public record AccessTokenResponse(String accessToken, long expiresIn) {
}
