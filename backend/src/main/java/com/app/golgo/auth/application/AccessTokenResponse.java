package com.app.golgo.auth.application;

public record AccessTokenResponse(String accessToken, long expiresIn) {
}
