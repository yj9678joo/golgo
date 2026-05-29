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
import com.app.golgo.auth.entity.TestLoginCredential;
import com.app.golgo.auth.entity.User;
import com.app.golgo.auth.repository.AuthProviderRepository;
import com.app.golgo.auth.repository.RefreshTokenRepository;
import com.app.golgo.auth.repository.TestLoginCredentialRepository;
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
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

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

	@Mock
	private TestLoginCredentialRepository testLoginCredentialRepository;

	private AuthService authService;
	private PasswordEncoder passwordEncoder;

	@BeforeEach
	void setUp() {
		JwtProvider jwtProvider = new JwtProvider(
			"0123456789012345678901234567890101234567890123456789012345678901",
			900,
			604800,
			CLOCK
		);
		passwordEncoder = new BCryptPasswordEncoder();
		authService = new AuthService(
			userRepository,
			authProviderRepository,
			refreshTokenRepository,
			testLoginCredentialRepository,
			jwtProvider,
			passwordEncoder,
			CLOCK
		);
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

	@Test
	void testLoginIssuesTokenPairWhenCredentialMatches() {
		User user = User.create("test01@golgo.local", "test01", null, CLOCK);
		user.assignIdForTest(USER_ID);
		TestLoginCredential credential = new TestLoginCredential("test01", passwordEncoder.encode("test01"), user);
		when(testLoginCredentialRepository.findByLoginId("test01")).thenReturn(Optional.of(credential));
		when(userRepository.findByIdAndDeletedAtIsNull(USER_ID)).thenReturn(Optional.of(user));

		TokenPair tokens = authService.loginWithTestCredential("test01", "test01");

		assertThat(tokens.accessToken()).isNotBlank();
		assertThat(tokens.refreshToken()).isNotBlank();
		assertThat(tokens.expiresIn()).isEqualTo(900);
	}

	@Test
	void testLoginThrowsUnauthorizedWhenPasswordDoesNotMatch() {
		User user = User.create("test01@golgo.local", "test01", null, CLOCK);
		user.assignIdForTest(USER_ID);
		TestLoginCredential credential = new TestLoginCredential("test01", passwordEncoder.encode("test01"), user);
		when(testLoginCredentialRepository.findByLoginId("test01")).thenReturn(Optional.of(credential));

		org.assertj.core.api.ThrowableAssert.ThrowingCallable action =
			() -> authService.loginWithTestCredential("test01", "wrong");

		assertThat(org.assertj.core.api.Assertions.catchThrowable(action))
			.isInstanceOf(AuthException.class)
			.hasMessage("아이디 또는 비밀번호가 올바르지 않습니다.")
			.extracting(error -> ((AuthException) error).status(), error -> ((AuthException) error).code())
			.containsExactly(HttpStatus.UNAUTHORIZED, "AUTH_010");
	}
}
