package com.app.golgo.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.app.golgo.auth.dto.AccessTokenResponse;
import com.app.golgo.auth.dto.OAuthUserProfile;
import com.app.golgo.auth.dto.RegisterRequest;
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
	void registerCreatesUserAndIssuesTokenPair() {
		RegisterRequest request = new RegisterRequest(
			"golgo01",
			"Password!1",
			"홍길동",
			"user@example.com",
			"투자초보"
		);
		when(userRepository.existsByLoginIdAndDeletedAtIsNull("golgo01")).thenReturn(false);
		when(userRepository.existsByEmailAndDeletedAtIsNull("user@example.com")).thenReturn(false);
		when(userRepository.existsByNicknameAndDeletedAtIsNull("투자초보")).thenReturn(false);
		when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
			User user = invocation.getArgument(0);
			user.assignIdForTest(USER_ID);
			return user;
		});

		TokenPair tokens = authService.register(request);

		assertThat(tokens.accessToken()).isNotBlank();
		assertThat(tokens.refreshToken()).isNotBlank();
		assertThat(tokens.expiresIn()).isEqualTo(900);
	}

	@Test
	void loginIssuesTokenPairWhenPasswordMatches() {
		User user = User.createLocal(
			"golgo01",
			passwordEncoder.encode("Password!1"),
			"홍길동",
			"user@example.com",
			"투자초보",
			CLOCK
		);
		user.assignIdForTest(USER_ID);
		when(userRepository.findByLoginIdAndDeletedAtIsNull("golgo01")).thenReturn(Optional.of(user));

		TokenPair tokens = authService.loginWithPassword("golgo01", "Password!1");

		assertThat(tokens.accessToken()).isNotBlank();
		assertThat(tokens.refreshToken()).isNotBlank();
		assertThat(tokens.expiresIn()).isEqualTo(900);
	}

	@Test
	void registerRejectsWeakPassword() {
		RegisterRequest request = new RegisterRequest("golgo01", "password", "홍길동", "user@example.com", "투자초보");

		Throwable thrown = catchThrowable(() -> authService.register(request));

		assertThat(thrown)
			.isInstanceOf(AuthException.class)
			.hasMessage("비밀번호는 대문자, 특수문자를 포함해 8자 이상이어야 합니다.")
			.extracting(error -> ((AuthException) error).status(), error -> ((AuthException) error).code())
			.containsExactly(HttpStatus.BAD_REQUEST, "AUTH_013");
	}

	@Test
	void loginThrowsUnauthorizedWhenPasswordDoesNotMatch() {
		User user = User.createLocal(
			"golgo01",
			passwordEncoder.encode("Password!1"),
			"홍길동",
			"user@example.com",
			"투자초보",
			CLOCK
		);
		user.assignIdForTest(USER_ID);
		when(userRepository.findByLoginIdAndDeletedAtIsNull("golgo01")).thenReturn(Optional.of(user));

		Throwable thrown = catchThrowable(() -> authService.loginWithPassword("golgo01", "wrong"));

		assertThat(thrown)
			.isInstanceOf(AuthException.class)
			.hasMessage("아이디 또는 비밀번호가 올바르지 않습니다.")
			.extracting(error -> ((AuthException) error).status(), error -> ((AuthException) error).code())
			.containsExactly(HttpStatus.UNAUTHORIZED, "AUTH_010");
	}
}
