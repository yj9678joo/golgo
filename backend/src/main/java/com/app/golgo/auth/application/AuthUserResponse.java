package com.app.golgo.auth.application;

import com.app.golgo.auth.domain.SocialProvider;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AuthUserResponse(
	UUID userId,
	String email,
	String nickname,
	String profileImage,
	List<SocialProvider> connectedProviders,
	Instant createdAt
) {
}
