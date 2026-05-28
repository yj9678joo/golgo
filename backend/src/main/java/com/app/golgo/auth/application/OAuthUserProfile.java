package com.app.golgo.auth.application;

import com.app.golgo.auth.domain.SocialProvider;

public record OAuthUserProfile(
	SocialProvider provider,
	String providerId,
	String email,
	String nickname,
	String profileImage
) {
}
