package com.app.golgo.auth.application;

public record TokenPair(String accessToken, String refreshToken, long expiresIn) {
}
