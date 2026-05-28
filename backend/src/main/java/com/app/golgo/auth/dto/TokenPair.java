package com.app.golgo.auth.dto;

public record TokenPair(String accessToken, String refreshToken, long expiresIn) {
}
