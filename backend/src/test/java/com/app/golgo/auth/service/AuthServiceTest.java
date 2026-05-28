package com.app.golgo.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.app.golgo.auth.dto.AccessTokenResponse;
import com.app.golgo.auth.dto.OAuthUserProfile;
import com.app.golgo.auth.dto.TokenPair;
import com.app.golgo.auth.entity.AuthProvider;
import com.app.golgo.auth.entity.SocialProvider;
import com.app.golgo.auth.entity.User;
import com.app.golgo.auth.repository.AuthProviderRepository;
import com.app.golgo.auth.repository.RefreshTokenRepository;
import com.app.golgo.auth.repository.UserRepository;
import com.app.golgo.auth.security.JwtProvider;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

	private static final UUID USER_ID = UUID.fromString("018f0000-0000-7000-8000-000000000001");
	private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-05-28T00:00:00Z"), ZoneOffset.UTC);

	@Mock
	private UserRepository userRepository;

	@Mock
	private AuthProviderRepository authProviderRepository;

	@Mock
	private RefreshTokenRepository refreshTokenRepository;

	private AuthService authService;

	@BeforeEach
	void setUp() {
		JwtProvider jwtProvider = new JwtProvider(
			"0123456789012345678901234567890101234567890123456789012345678901",
			900,
			604800,
			CLOCK
		);
		authService = new AuthService(userRepository, authProviderRepository, refreshTokenRepository, jwtProvider, CLOCK);
	}

	@Test
	void oauthLoginMergesProviderIntoExistingUserByEmail() {
		User existingUser = User.create("user@example.com", "구글유저", null, CLOCK);
		existingUser.assignIdForTest(USER_ID);
		when(authProviderRepository.findByProviderAndProviderId(SocialProvider.NAVER, "naver-1"))
			.thenReturn(Optional.empty());
		when(userRepository.findByEmailAndDeletedAtIsNull("user@example.com")).thenReturn(Optional.of(existingUser));

		TokenPair tokens = authService.loginWithOAuth(new OAuthUserProfile(
			SocialProvider.NAVER,
			"naver-1",
			"user@example.com",
			"네이버유저",
			"https://example.com/profile.png"
		));

		ArgumentCaptor<AuthProvider> providerCaptor = ArgumentCaptor.forClass(AuthProvider.class);
		verify(authProviderRepository).save(providerCaptor.capture());
		assertThat(providerCaptor.getValue().getUser()).isEqualTo(existingUser);
		assertThat(providerCaptor.getValue().getProvider()).isEqualTo(SocialProvider.NAVER);
		assertThat(tokens.accessToken()).isNotBlank();
		assertThat(tokens.refreshToken()).isNotBlank();
	}

	@Test
	void oauthLoginUsesExistingProviderConnectionWhenProviderAlreadyLinked() {
		User existingUser = User.create("user@example.com", "구글유저", null, CLOCK);
		existingUser.assignIdForTest(USER_ID);
		AuthProvider linkedProvider = AuthProvider.connect(existingUser, SocialProvider.GOOGLE, "google-1", CLOCK);
		when(authProviderRepository.findByProviderAndProviderId(SocialProvider.GOOGLE, "google-1"))
			.thenReturn(Optional.of(linkedProvider));

		TokenPair tokens = authService.loginWithOAuth(new OAuthUserProfile(
			SocialProvider.GOOGLE,
			"google-1",
			"user@example.com",
			"구글유저",
			null
		));

		assertThat(tokens.accessToken()).isNotBlank();
		assertThat(tokens.refreshToken()).isNotBlank();
	}

	@Test
	void refreshAccessTokenDeletesExpiredRefreshTokenAndIssuesNewAccessToken() {
		User existingUser = User.create("user@example.com", "구글유저", null, CLOCK);
		existingUser.assignIdForTest(USER_ID);
		JwtProvider jwtProvider = new JwtProvider(
			"0123456789012345678901234567890101234567890123456789012345678901",
			900,
			604800,
			CLOCK
		);
		String refreshToken = jwtProvider.createRefreshToken(USER_ID);
		when(refreshTokenRepository.existsByTokenHash(any())).thenReturn(true);
		when(userRepository.findByIdAndDeletedAtIsNull(USER_ID)).thenReturn(Optional.of(existingUser));

		AccessTokenResponse response = authService.refreshAccessToken(refreshToken);

		assertThat(response.accessToken()).isNotBlank();
		assertThat(response.expiresIn()).isEqualTo(900);
	}
}
