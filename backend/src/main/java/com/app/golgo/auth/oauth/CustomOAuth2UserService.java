package com.app.golgo.auth.oauth;

import com.app.golgo.auth.application.OAuthUserProfile;
import com.app.golgo.auth.domain.SocialProvider;
import java.util.Map;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

	private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();

	@Override
	public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
		OAuth2User user = delegate.loadUser(userRequest);
		SocialProvider provider = SocialProvider.from(userRequest.getClientRegistration().getRegistrationId());
		OAuthUserProfile profile = switch (provider) {
			case GOOGLE -> googleProfile(user.getAttributes());
			case NAVER -> naverProfile(user.getAttributes());
			case KAKAO -> throw new OAuth2AuthenticationException("Kakao login is not enabled");
		};
		return new OAuth2UserPrincipal(profile, user.getAttributes(), user.getAuthorities());
	}

	private OAuthUserProfile googleProfile(Map<String, Object> attributes) {
		return new OAuthUserProfile(
			SocialProvider.GOOGLE,
			(String) attributes.get("sub"),
			(String) attributes.get("email"),
			(String) attributes.get("name"),
			(String) attributes.get("picture")
		);
	}

	@SuppressWarnings("unchecked")
	private OAuthUserProfile naverProfile(Map<String, Object> attributes) {
		Map<String, Object> response = (Map<String, Object>) attributes.get("response");
		return new OAuthUserProfile(
			SocialProvider.NAVER,
			(String) response.get("id"),
			(String) response.get("email"),
			(String) response.get("nickname"),
			(String) response.get("profile_image")
		);
	}
}
