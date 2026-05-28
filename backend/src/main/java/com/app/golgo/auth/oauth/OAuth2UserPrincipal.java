package com.app.golgo.auth.oauth;

import com.app.golgo.auth.application.OAuthUserProfile;
import java.util.Collection;
import java.util.Map;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

public class OAuth2UserPrincipal implements OAuth2User {

	private final OAuthUserProfile profile;
	private final Map<String, Object> attributes;
	private final Collection<? extends GrantedAuthority> authorities;

	public OAuth2UserPrincipal(
		OAuthUserProfile profile,
		Map<String, Object> attributes,
		Collection<? extends GrantedAuthority> authorities
	) {
		this.profile = profile;
		this.attributes = attributes;
		this.authorities = authorities;
	}

	public OAuthUserProfile profile() {
		return profile;
	}

	@Override
	public Map<String, Object> getAttributes() {
		return attributes;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return authorities;
	}

	@Override
	public String getName() {
		return profile.providerId();
	}
}
