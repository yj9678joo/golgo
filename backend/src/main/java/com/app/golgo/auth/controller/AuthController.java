package com.app.golgo.auth.controller;

import com.app.golgo.auth.dto.AccessTokenResponse;
import com.app.golgo.auth.service.AuthService;
import com.app.golgo.auth.dto.AuthUserResponse;
import com.app.golgo.auth.dto.NicknameUpdateRequest;
import com.app.golgo.auth.dto.NicknameUpdateResponse;
import com.app.golgo.auth.dto.ProviderListResponse;
import com.app.golgo.auth.dto.RefreshTokenRequest;
import com.app.golgo.auth.dto.RemainingProvidersResponse;
import com.app.golgo.auth.dto.LoginRequest;
import com.app.golgo.auth.dto.RegisterRequest;
import com.app.golgo.auth.dto.TokenPair;
import com.app.golgo.auth.entity.SocialProvider;
import com.app.golgo.auth.security.JwtPrincipal;
import com.app.golgo.common.api.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.io.IOException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@GetMapping("/{provider}/login")
	public void login(@PathVariable String provider, HttpServletResponse response) throws IOException {
		SocialProvider socialProvider = SocialProvider.from(provider);
		if (!socialProvider.isEnabled()) {
			throw new IllegalArgumentException("지원하지 않는 소셜 로그인입니다.");
		}
		response.sendRedirect("/api/oauth2/authorization/" + provider.toLowerCase());
	}

	@PostMapping("/refresh")
	public ApiResponse<AccessTokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
		return ApiResponse.ok(authService.refreshAccessToken(request.refreshToken()));
	}

	@PostMapping("/register")
	public ApiResponse<TokenPair> register(@Valid @RequestBody RegisterRequest request) {
		return ApiResponse.ok(authService.register(request));
	}

	@PostMapping("/login")
	public ApiResponse<TokenPair> login(@Valid @RequestBody LoginRequest request) {
		return ApiResponse.ok(authService.loginWithPassword(request.loginId(), request.password()));
	}

	@PostMapping("/logout")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void logout(@AuthenticationPrincipal JwtPrincipal principal, @Valid @RequestBody RefreshTokenRequest request) {
		authService.logout(principal.userId(), request.refreshToken());
	}

	@GetMapping("/me")
	public ApiResponse<AuthUserResponse> me(@AuthenticationPrincipal JwtPrincipal principal) {
		return ApiResponse.ok(authService.me(principal.userId()));
	}

	@PatchMapping("/me/nickname")
	public ApiResponse<NicknameUpdateResponse> updateNickname(
		@AuthenticationPrincipal JwtPrincipal principal,
		@Valid @RequestBody NicknameUpdateRequest request
	) {
		return ApiResponse.ok(authService.updateNickname(principal.userId(), request.nickname()));
	}

	@GetMapping("/me/providers")
	public ApiResponse<ProviderListResponse> providers(@AuthenticationPrincipal JwtPrincipal principal) {
		return ApiResponse.ok(authService.providers(principal.userId()));
	}

	@DeleteMapping("/me/providers/{provider}")
	public ApiResponse<RemainingProvidersResponse> unlinkProvider(
		@AuthenticationPrincipal JwtPrincipal principal,
		@PathVariable String provider
	) {
		return ApiResponse.ok(authService.unlinkProvider(principal.userId(), SocialProvider.from(provider)));
	}

	@DeleteMapping("/me")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteMe(@AuthenticationPrincipal JwtPrincipal principal) {
		authService.deleteMe(principal.userId());
	}
}
