package com.app.golgo.auth.dto;

import com.app.golgo.auth.entity.SocialProvider;
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
