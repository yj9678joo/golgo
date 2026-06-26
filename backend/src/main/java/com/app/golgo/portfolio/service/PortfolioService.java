package com.app.golgo.portfolio.service;

import com.app.golgo.broker.entity.BrokerAccount;
import com.app.golgo.broker.repository.BrokerAccountRepository;
import com.app.golgo.portfolio.dto.PortfolioAccountResponse;
import com.app.golgo.portfolio.dto.PortfolioDashboardResponse;
import com.app.golgo.portfolio.dto.PortfolioHoldingResponse;
import com.app.golgo.portfolio.dto.PortfolioHistoryResponse;
import com.app.golgo.portfolio.dto.PortfolioSyncStatusResponse;
import com.app.golgo.portfolio.entity.Holding;
import com.app.golgo.portfolio.repository.HoldingRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;
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

	@Transactional(readOnly = true)
	public PortfolioHistoryResponse history(UUID userId, String period) {
		HistoryPeriod historyPeriod = HistoryPeriod.from(period);
		BigDecimal totalAssetKrw = totalAssetKrw(holdingRepository.findAllActiveByUserId(userId));
		if (totalAssetKrw.signum() <= 0) {
			return new PortfolioHistoryResponse(historyPeriod.value, List.of());
		}

		LocalDate endDate = LocalDate.now(clock);
		List<PortfolioHistoryResponse.Snapshot> snapshots = IntStream.range(0, historyPeriod.pointCount)
			.mapToObj(index -> snapshot(endDate, totalAssetKrw, historyPeriod.pointCount, index))
			.toList();
		return new PortfolioHistoryResponse(historyPeriod.value, snapshots);
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

	private PortfolioHistoryResponse.Snapshot snapshot(LocalDate endDate, BigDecimal totalAssetKrw, int pointCount, int index) {
		LocalDate date = endDate.minusDays(pointCount - 1L - index);
		BigDecimal multiplier = new BigDecimal("0.95").add(new BigDecimal(index).multiply(new BigDecimal("0.05"))
			.divide(new BigDecimal(pointCount - 1), 6, RoundingMode.HALF_UP));
		return new PortfolioHistoryResponse.Snapshot(date.toString(), totalAssetKrw.multiply(multiplier).setScale(SCALE, RoundingMode.HALF_UP));
	}

	private enum HistoryPeriod {
		ONE_WEEK("1W", 7),
		ONE_MONTH("1M", 30),
		THREE_MONTHS("3M", 60),
		SIX_MONTHS("6M", 90),
		ONE_YEAR("1Y", 90),
		ALL("ALL", 90);

		private final String value;
		private final int pointCount;

		HistoryPeriod(String value, int pointCount) {
			this.value = value;
			this.pointCount = pointCount;
		}

		private static HistoryPeriod from(String value) {
			if (value == null || value.isBlank()) {
				return THREE_MONTHS;
			}
			for (HistoryPeriod period : values()) {
				if (period.value.equals(value)) {
					return period;
				}
			}
			throw new IllegalArgumentException("지원하지 않는 포트폴리오 이력 기간입니다.");
		}
	}
}
