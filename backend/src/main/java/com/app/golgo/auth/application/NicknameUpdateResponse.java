package com.app.golgo.auth.application;

import java.time.Instant;

public record NicknameUpdateResponse(String nickname, Instant updatedAt) {
}
