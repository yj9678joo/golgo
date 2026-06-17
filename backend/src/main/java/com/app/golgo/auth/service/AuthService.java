package com.app.golgo.auth.service;

import com.app.golgo.auth.dto.AccessTokenResponse;
import com.app.golgo.auth.dto.AuthUserResponse;
import com.app.golgo.auth.dto.NicknameUpdateResponse;
import com.app.golgo.auth.dto.OAuthUserProfile;
import com.app.golgo.auth.dto.ProviderConnectionResponse;
import com.app.golgo.auth.dto.ProviderListResponse;
import com.app.golgo.auth.dto.RemainingProvidersResponse;
import com.app.golgo.auth.dto.RegisterRequest;
import com.app.golgo.auth.dto.TokenPair;
import com.app.golgo.auth.entity.AuthProvider;
import com.app.golgo.auth.entity.RefreshToken;
import com.app.golgo.auth.entity.SocialProvider;
import com.app.golgo.auth.entity.User;
import com.app.golgo.auth.repository.AuthProviderRepository;
import com.app.golgo.auth.repository.RefreshTokenRepository;
import com.app.golgo.auth.repository.UserRepository;
import com.app.golgo.auth.security.JwtPrincipal;
import com.app.golgo.auth.security.JwtProvider;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

	private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$");

	private final UserRepository userRepository;
	private final AuthProviderRepository authProviderRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final JwtProvider jwtProvider;
	private final PasswordEncoder passwordEncoder;
	private final Clock clock;

	public AuthService(
		UserRepository userRepository,
		AuthProviderRepository authProviderRepository,
		RefreshTokenRepository refreshTokenRepository,
		JwtProvider jwtProvider,
		PasswordEncoder passwordEncoder,
		Clock clock
	) {
		this.userRepository = userRepository;
		this.authProviderRepository = authProviderRepository;
		this.refreshTokenRepository = refreshTokenRepository;
		this.jwtProvider = jwtProvider;
		this.passwordEncoder = passwordEncoder;
		this.clock = clock;
	}

	@Transactional
	public TokenPair loginWithOAuth(OAuthUserProfile profile) {
		if (!profile.provider().isEnabled()) {
			throw new AuthException(HttpStatus.BAD_REQUEST, "AUTH_009", "지원하지 않는 소셜 로그인입니다.");
		}
		User user = authProviderRepository.findByProviderAndProviderId(profile.provider(), profile.providerId())
			.map(AuthProvider::getUser)
			.orElseGet(() -> connectProvider(profile));
		return issueTokenPair(user);
	}

	@Transactional
	public TokenPair register(RegisterRequest request) {
		validatePassword(request.password());
		if (userRepository.existsByLoginIdAndDeletedAtIsNull(request.loginId())) {
			throw new AuthException(HttpStatus.CONFLICT, "AUTH_011", "이미 사용 중인 아이디입니다.");
		}
		if (userRepository.existsByEmailAndDeletedAtIsNull(request.email())) {
			throw new AuthException(HttpStatus.CONFLICT, "AUTH_012", "이미 사용 중인 이메일입니다.");
		}
		if (userRepository.existsByNicknameAndDeletedAtIsNull(request.nickname())) {
			throw new AuthException(HttpStatus.CONFLICT, "AUTH_006", "이미 사용 중인 닉네임입니다.");
		}
		User user = userRepository.save(User.createLocal(
			request.loginId(),
			passwordEncoder.encode(request.password()),
			request.name(),
			request.email(),
			request.nickname(),
			clock
		));
		return issueTokenPair(user);
	}

	@Transactional
	public TokenPair loginWithPassword(String loginId, String password) {
		User user = userRepository.findByLoginIdAndDeletedAtIsNull(loginId)
			.orElseThrow(this::invalidLogin);
		if (!passwordEncoder.matches(password, user.getPasswordHash())) {
			throw invalidLogin();
		}
		return issueTokenPair(user);
	}

	@Transactional
	public AccessTokenResponse refreshAccessToken(String refreshToken) {
		JwtPrincipal principal = jwtProvider.parseRefreshToken(refreshToken);
		String tokenHash = TokenHash.sha256(refreshToken);
		if (!refreshTokenRepository.existsByTokenHash(tokenHash)) {
			throw new AuthException(HttpStatus.UNAUTHORIZED, "AUTH_002", "유효하지 않은 refresh token입니다.");
		}
		User user = findActiveUser(principal.userId());
		String accessToken = jwtProvider.createAccessToken(user.getId());
		return new AccessTokenResponse(accessToken, jwtProvider.accessTokenValiditySeconds());
	}

	@Transactional
	public void logout(UUID userId, String refreshToken) {
		findActiveUser(userId);
		refreshTokenRepository.deleteByTokenHash(TokenHash.sha256(refreshToken));
	}

	@Transactional(readOnly = true)
	public AuthUserResponse me(UUID userId) {
		User user = findActiveUser(userId);
		List<SocialProvider> providers = authProviderRepository.findAllByUserId(userId).stream()
			.map(AuthProvider::getProvider)
			.toList();
		return new AuthUserResponse(
			user.getId(),
			user.getEmail(),
			user.getNickname(),
			user.getProfileImage(),
			user.isOnboardingCompleted(),
			providers,
			user.getCreatedAt()
		);
	}

	@Transactional
	public AuthUserResponse completeOnboarding(UUID userId) {
		User user = findActiveUser(userId);
		user.completeOnboarding(clock);
		List<SocialProvider> providers = authProviderRepository.findAllByUserId(userId).stream()
			.map(AuthProvider::getProvider)
			.toList();
		return new AuthUserResponse(
			user.getId(),
			user.getEmail(),
			user.getNickname(),
			user.getProfileImage(),
			user.isOnboardingCompleted(),
			providers,
			user.getCreatedAt()
		);
	}

	@Transactional
	public NicknameUpdateResponse updateNickname(UUID userId, String nickname) {
		if (userRepository.existsByNicknameAndDeletedAtIsNull(nickname)) {
			throw new AuthException(HttpStatus.CONFLICT, "AUTH_006", "이미 사용 중인 닉네임입니다.");
		}
		User user = findActiveUser(userId);
		user.changeNickname(nickname, clock);
		return new NicknameUpdateResponse(user.getNickname(), user.getUpdatedAt());
	}

	@Transactional(readOnly = true)
	public ProviderListResponse providers(UUID userId) {
		findActiveUser(userId);
		List<ProviderConnectionResponse> providers = authProviderRepository.findAllByUserId(userId).stream()
			.map(provider -> new ProviderConnectionResponse(provider.getProvider(), provider.getConnectedAt()))
			.toList();
		return new ProviderListResponse(providers);
	}

	@Transactional
	public RemainingProvidersResponse unlinkProvider(UUID userId, SocialProvider provider) {
		findActiveUser(userId);
		if (authProviderRepository.countByUserId(userId) <= 1) {
			throw new AuthException(HttpStatus.BAD_REQUEST, "AUTH_008", "마지막 Provider는 해제할 수 없습니다.");
		}
		authProviderRepository.deleteByUserIdAndProvider(userId, provider);
		List<SocialProvider> remaining = authProviderRepository.findAllByUserId(userId).stream()
			.map(AuthProvider::getProvider)
			.toList();
		return new RemainingProvidersResponse(remaining);
	}

	@Transactional
	public void deleteMe(UUID userId) {
		User user = findActiveUser(userId);
		refreshTokenRepository.deleteAllByUserId(userId);
		user.delete(clock);
	}

	private User connectProvider(OAuthUserProfile profile) {
		User user = userRepository.findByEmailAndDeletedAtIsNull(profile.email())
			.orElseGet(() -> userRepository.save(User.create(
				profile.email(),
				normalizeNickname(profile.nickname()),
				profile.profileImage(),
				clock
			)));
		authProviderRepository.save(AuthProvider.connect(user, profile.provider(), profile.providerId(), clock));
		return user;
	}

	private TokenPair issueTokenPair(User user) {
		String accessToken = jwtProvider.createAccessToken(user.getId());
		String refreshToken = jwtProvider.createRefreshToken(user.getId());
		Instant expiresAt = jwtProvider.parseRefreshToken(refreshToken).expiresAt();
		refreshTokenRepository.save(RefreshToken.issue(user, TokenHash.sha256(refreshToken), expiresAt, clock));
		return new TokenPair(accessToken, refreshToken, jwtProvider.accessTokenValiditySeconds());
	}

	private User findActiveUser(UUID userId) {
		return userRepository.findByIdAndDeletedAtIsNull(userId)
			.orElseThrow(() -> new AuthException(HttpStatus.UNAUTHORIZED, "AUTH_002", "유효하지 않은 사용자입니다."));
	}

	private String normalizeNickname(String nickname) {
		String fallback = "골고유저";
		String normalized = nickname == null || nickname.isBlank() ? fallback : nickname.replaceAll("[^가-힣A-Za-z0-9]", "");
		if (normalized.length() < 2) {
			return fallback;
		}
		return normalized.substring(0, Math.min(12, normalized.length()));
	}

	private void validatePassword(String password) {
		if (!PASSWORD_PATTERN.matcher(password).matches()) {
			throw new AuthException(HttpStatus.BAD_REQUEST, "AUTH_013", "비밀번호는 대문자, 특수문자를 포함해 8자 이상이어야 합니다.");
		}
	}

	private AuthException invalidLogin() {
		return new AuthException(HttpStatus.UNAUTHORIZED, "AUTH_010", "아이디 또는 비밀번호가 올바르지 않습니다.");
	}
}
