package com.app.golgo.auth.oauth;

import com.app.golgo.auth.application.AuthService;
import com.app.golgo.auth.application.TokenPair;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

	private final AuthService authService;
	private final String frontendCallbackUrl;

	public OAuth2LoginSuccessHandler(
		AuthService authService,
		@Value("${golgo.frontend.auth-callback-url:http://localhost:5173/auth/callback}") String frontendCallbackUrl
	) {
		this.authService = authService;
		this.frontendCallbackUrl = frontendCallbackUrl;
	}

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
		throws IOException, ServletException {
		OAuth2UserPrincipal principal = (OAuth2UserPrincipal) authentication.getPrincipal();
		TokenPair tokens = authService.loginWithOAuth(principal.profile());
		String redirectUrl = frontendCallbackUrl
			+ "?accessToken=" + encode(tokens.accessToken())
			+ "&refreshToken=" + encode(tokens.refreshToken());
		response.sendRedirect(redirectUrl);
	}

	private String encode(String value) {
		return URLEncoder.encode(value, StandardCharsets.UTF_8);
	}
}
