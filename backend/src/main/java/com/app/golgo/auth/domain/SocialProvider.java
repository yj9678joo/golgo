package com.app.golgo.auth.domain;

import java.util.Locale;

public enum SocialProvider {
	GOOGLE,
	NAVER,
	KAKAO;

	public static SocialProvider from(String value) {
		return SocialProvider.valueOf(value.toUpperCase(Locale.ROOT));
	}

	public boolean isEnabled() {
		return this == GOOGLE || this == NAVER;
	}
}
