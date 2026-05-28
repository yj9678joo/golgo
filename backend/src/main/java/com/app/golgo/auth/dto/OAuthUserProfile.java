package com.app.golgo.auth.dto;

import com.app.golgo.auth.entity.SocialProvider;

public record OAuthUserProfile(
	SocialProvider provider,
	String providerId,
	String email,
	String nickname,
	String profileImage
) {
}
