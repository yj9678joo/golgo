package com.app.golgo.auth.dto;

import java.time.Instant;

public record NicknameUpdateResponse(String nickname, Instant updatedAt) {
}
