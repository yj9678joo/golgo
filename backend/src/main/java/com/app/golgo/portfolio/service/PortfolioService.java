package com.app.golgo.portfolio.service;

import com.app.golgo.broker.entity.BrokerAccount;
import com.app.golgo.broker.repository.BrokerAccountRepository;
import com.app.golgo.portfolio.dto.PortfolioAccountResponse;
import com.app.golgo.portfolio.dto.PortfolioDashboardResponse;
import com.app.golgo.portfolio.dto.PortfolioHoldingResponse;
import com.app.golgo.portfolio.dto.PortfolioSyncStatusResponse;
import com.app.golgo.portfolio.entity.Holding;
import com.app.golgo.portfolio.repository.HoldingRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PortfolioService {

	private static final int OUTDATED_DAYS = 3;
	private static final int SCALE = 2;

	private final BrokerAccountRepository brokerAccountRepository;
	private final HoldingRepository holdingRepository;
	private final Clock clock;

	public PortfolioService(
		BrokerAccountRepository brokerAccountRepository,
		HoldingRepository holdingRepository,
		Clock clock
	) {
		this.brokerAccountRepository = brokerAccountRepository;
		this.holdingRepository = holdingRepository;
		this.clock = clock;
	}

	@Transactional(readOnly = true)
	public PortfolioDashboardResponse dashboard(UUID userId) {
		List<BrokerAccount> accounts = brokerAccountRepository.findAllByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(userId);
		List<Holding> holdings = holdingRepository.findAllActiveByUserId(userId);
		BigDecimal totalAssetKrw = totalAssetKrw(holdings);
		BigDecimal totalProfitKrw = totalProfitKrw(holdings);
		List<PortfolioHoldingResponse> holdingResponses = holdings.stream()
			.sorted(Comparator.comparing(Holding::getCurrentValueKrw).reversed())
			.map(holding -> PortfolioHoldingResponse.from(holding, totalAssetKrw))
			.toList();
		List<PortfolioAccountResponse> accountResponses = accounts.stream()
			.map(account -> PortfolioAccountResponse.from(account, syncStatus(account), daysSinceSync(account)))
			.toList();

		return new PortfolioDashboardResponse(
			totalAssetKrw,
			totalProfitKrw,
			profitRate(totalProfitKrw, totalAssetKrw.subtract(totalProfitKrw)),
			accountResponses,
			holdingResponses,
			updatedAt(accounts)
		);
	}

	@Transactional(readOnly = true)
	public List<PortfolioSyncStatusResponse> syncStatus(UUID userId) {
		return brokerAccountRepository.findAllByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(userId).stream()
			.map(account -> PortfolioSyncStatusResponse.from(account, syncStatus(account), daysSinceSync(account)))
			.toList();
	}

	private BigDecimal totalAssetKrw(List<Holding> holdings) {
		return holdings.stream()
			.map(Holding::getCurrentValueKrw)
			.reduce(BigDecimal.ZERO, BigDecimal::add)
			.setScale(SCALE, RoundingMode.HALF_UP);
	}

	private BigDecimal totalProfitKrw(List<Holding> holdings) {
		return holdings.stream()
			.map(this::profitKrw)
			.reduce(BigDecimal.ZERO, BigDecimal::add)
			.setScale(SCALE, RoundingMode.HALF_UP);
	}

	private BigDecimal profitKrw(Holding holding) {
		if (holding.getCurrentPrice() == null || holding.getCurrentPrice().signum() <= 0) {
			return BigDecimal.ZERO;
		}
		BigDecimal costKrw = holding.getCurrentValueKrw()
			.multiply(holding.getAvgPrice())
			.divide(holding.getCurrentPrice(), SCALE, RoundingMode.HALF_UP);
		return holding.getCurrentValueKrw().subtract(costKrw);
	}

	private BigDecimal profitRate(BigDecimal profit, BigDecimal cost) {
		if (cost.signum() <= 0) {
			return BigDecimal.ZERO.setScale(SCALE, RoundingMode.HALF_UP);
		}
		return profit.multiply(new BigDecimal("100")).divide(cost, SCALE, RoundingMode.HALF_UP);
	}

	private String syncStatus(BrokerAccount account) {
		Long days = daysSinceSync(account);
		if (days == null || days >= OUTDATED_DAYS) {
			return "OUTDATED";
		}
		return "SYNCED";
	}

	private Long daysSinceSync(BrokerAccount account) {
		if (account.getLastSyncedAt() == null) {
			return null;
		}
		return Duration.between(account.getLastSyncedAt(), Instant.now(clock)).toDays();
	}

	private Instant updatedAt(List<BrokerAccount> accounts) {
		return accounts.stream()
			.map(BrokerAccount::getLastSyncedAt)
			.filter(lastSyncedAt -> lastSyncedAt != null)
			.max(Instant::compareTo)
			.orElse(Instant.now(clock));
	}
}
