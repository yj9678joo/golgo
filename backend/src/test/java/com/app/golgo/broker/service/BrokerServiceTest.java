package com.app.golgo.broker.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.app.golgo.auth.entity.User;
import com.app.golgo.auth.repository.UserRepository;
import com.app.golgo.broker.dto.BrokerAccountResponse;
import com.app.golgo.broker.dto.ScreenshotBrokerConnectRequest;
import com.app.golgo.broker.entity.BrokerAccount;
import com.app.golgo.broker.repository.BrokerAccountRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BrokerServiceTest {

	private static final UUID USER_ID = UUID.fromString("018f0000-0000-7000-8000-000000000001");
	private static final UUID ACCOUNT_ID = UUID.fromString("018f0000-0000-7000-8000-000000000002");
	private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-06-17T00:00:00Z"), ZoneOffset.UTC);

	@Mock
	private BrokerAccountRepository brokerAccountRepository;

	@Mock
	private UserRepository userRepository;

	private BrokerService brokerService;

	@BeforeEach
	void setUp() {
		brokerService = new BrokerService(brokerAccountRepository, userRepository, CLOCK);
	}

	@Test
	void createScreenshotAccountStoresScreenshotConnectionOnly() {
		User user = User.createLocal("golgo01", "hash", "홍길동", "user@example.com", "투자초보", CLOCK);
		user.assignIdForTest(USER_ID);
		when(userRepository.findByIdAndDeletedAtIsNull(USER_ID)).thenReturn(Optional.of(user));
		when(brokerAccountRepository.save(any(BrokerAccount.class))).thenAnswer(invocation -> {
			BrokerAccount account = invocation.getArgument(0);
			account.assignIdForTest(ACCOUNT_ID);
			return account;
		});

		BrokerAccountResponse response = brokerService.createScreenshotAccount(
			USER_ID,
			new ScreenshotBrokerConnectRequest("mirae", "미래에셋 메인")
		);

		assertThat(response.accountId()).isEqualTo(ACCOUNT_ID);
		assertThat(response.brokerCode()).isEqualTo("MIRAE");
		assertThat(response.connectionType()).isEqualTo("SCREENSHOT");
		assertThat(response.accountNickname()).isEqualTo("미래에셋 메인");
	}

	@Test
	void findActiveAccountForUserRejectsMissingAccount() {
		when(brokerAccountRepository.findByIdAndUserIdAndDeletedAtIsNull(ACCOUNT_ID, USER_ID))
			.thenReturn(Optional.empty());

		Throwable thrown = catchThrowable(() -> brokerService.findActiveAccountForUser(USER_ID, ACCOUNT_ID));

		assertThat(thrown)
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessage("계좌를 찾을 수 없습니다.");
	}
}
