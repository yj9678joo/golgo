package com.app.golgo.broker.service;

import com.app.golgo.auth.entity.User;
import com.app.golgo.auth.repository.UserRepository;
import com.app.golgo.broker.dto.BrokerAccountResponse;
import com.app.golgo.broker.dto.ScreenshotBrokerConnectRequest;
import com.app.golgo.broker.entity.BrokerAccount;
import com.app.golgo.broker.repository.BrokerAccountRepository;
import java.time.Clock;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BrokerService {

	private final BrokerAccountRepository brokerAccountRepository;
	private final UserRepository userRepository;
	private final Clock clock;

	public BrokerService(
		BrokerAccountRepository brokerAccountRepository,
		UserRepository userRepository,
		Clock clock
	) {
		this.brokerAccountRepository = brokerAccountRepository;
		this.userRepository = userRepository;
		this.clock = clock;
	}

	@Transactional
	public BrokerAccountResponse createScreenshotAccount(UUID userId, ScreenshotBrokerConnectRequest request) {
		User user = userRepository.findByIdAndDeletedAtIsNull(userId)
			.orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
		BrokerAccount account = brokerAccountRepository.save(BrokerAccount.createScreenshot(
			user,
			request.brokerCode().trim().toUpperCase(),
			normalizeNickname(request.accountNickname()),
			clock
		));
		return BrokerAccountResponse.from(account);
	}

	@Transactional(readOnly = true)
	public List<BrokerAccountResponse> accounts(UUID userId) {
		return brokerAccountRepository.findAllByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(userId).stream()
			.map(BrokerAccountResponse::from)
			.toList();
	}

	@Transactional(readOnly = true)
	public BrokerAccount findActiveAccountForUser(UUID userId, UUID accountId) {
		return brokerAccountRepository.findByIdAndUserIdAndDeletedAtIsNull(accountId, userId)
			.orElseThrow(() -> new IllegalArgumentException("계좌를 찾을 수 없습니다."));
	}

	private String normalizeNickname(String accountNickname) {
		if (accountNickname == null || accountNickname.isBlank()) {
			return "MTS 캡처 계좌";
		}
		return accountNickname.trim();
	}
}
