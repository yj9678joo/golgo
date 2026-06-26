package com.app.golgo.portfolio.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.app.golgo.auth.entity.User;
import com.app.golgo.broker.entity.BrokerAccount;
import com.app.golgo.broker.repository.BrokerAccountRepository;
import com.app.golgo.portfolio.dto.HoldingPayload;
import com.app.golgo.portfolio.dto.PortfolioDashboardResponse;
import com.app.golgo.portfolio.dto.PortfolioHistoryResponse;
import com.app.golgo.portfolio.dto.PortfolioSyncStatusResponse;
import com.app.golgo.portfolio.entity.Holding;
import com.app.golgo.portfolio.repository.HoldingRepository;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PortfolioServiceTest {

	private static final UUID USER_ID = UUID.fromString("018f0000-0000-7000-8000-000000000001");
	private static final UUID ACCOUNT_ID = UUID.fromString("018f0000-0000-7000-8000-000000000002");
	private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-06-17T00:00:00Z"), ZoneOffset.UTC);

	@Mock
	private BrokerAccountRepository brokerAccountRepository;

	@Mock
	private HoldingRepository holdingRepository;

	private PortfolioService service;
	private User user;
	private BrokerAccount account;

	@BeforeEach
	void setUp() {
		service = new PortfolioService(brokerAccountRepository, holdingRepository, CLOCK);
		user = User.createLocal("golgo01", "hash", "홍길동", "user@example.com", "투자초보", CLOCK);
		user.assignIdForTest(USER_ID);
		account = BrokerAccount.createScreenshot(user, "MIRAE", "미래에셋 메인", CLOCK);
		account.assignIdForTest(ACCOUNT_ID);
		account.touchLastSyncedAt(CLOCK);
	}

	@Test
	void dashboardCalculatesPortfolioTotalsAndWeights() {
		when(brokerAccountRepository.findAllByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(USER_ID))
			.thenReturn(List.of(account));
		when(holdingRepository.findAllActiveByUserId(USER_ID))
			.thenReturn(List.of(holding("005930", "삼성전자", "4000000", "68000", "72000")));

		PortfolioDashboardResponse response = service.dashboard(USER_ID);

		assertThat(response.totalAssetKrw()).isEqualByComparingTo("4000000.00");
		assertThat(response.totalProfitKrw()).isEqualByComparingTo("222222.22");
		assertThat(response.profitRate()).isEqualByComparingTo("5.88");
		assertThat(response.accounts()).singleElement()
			.extracting("syncStatus")
			.isEqualTo("SYNCED");
		assertThat(response.holdings()).singleElement()
			.satisfies(holding -> {
				assertThat(holding.weight()).isEqualByComparingTo("100.00");
				assertThat(holding.profitRate()).isEqualByComparingTo("5.88");
			});
	}

	@Test
	void historyReturnsDerivedDashboardHistoryForRequestedPeriodWithoutPersistedSnapshots() {
		when(holdingRepository.findAllActiveByUserId(USER_ID))
			.thenReturn(List.of(holding("005930", "삼성전자", "4000000", "68000", "72000")));

		PortfolioHistoryResponse response = service.history(USER_ID, "1W");

		assertThat(response.period()).isEqualTo("1W");
		assertThat(response.snapshots()).hasSize(7);
		assertThat(response.snapshots().getFirst().date()).isEqualTo("2026-06-11");
		assertThat(response.snapshots().getLast().date()).isEqualTo("2026-06-17");
		assertThat(response.snapshots().getLast().totalAssetKrw()).isEqualByComparingTo("4000000.00");
	}

	@Test
	void historyDefaultsToDerivedDashboardHistoryForThreeMonths() {
		when(holdingRepository.findAllActiveByUserId(USER_ID))
			.thenReturn(List.of(holding("005930", "삼성전자", "4000000", "68000", "72000")));

		PortfolioHistoryResponse response = service.history(USER_ID, null);

		assertThat(response.period()).isEqualTo("3M");
		assertThat(response.snapshots()).hasSize(60);
	}

	@Test
	void historyReturnsEmptyDerivedDashboardHistoryWhenNoHoldingsExist() {
		when(holdingRepository.findAllActiveByUserId(USER_ID))
			.thenReturn(List.of());

		PortfolioHistoryResponse response = service.history(USER_ID, "6M");

		assertThat(response.period()).isEqualTo("6M");
		assertThat(response.snapshots()).isEmpty();
	}

	@Test
	void syncStatusMarksAccountsOutdatedAfterThreeDays() {
		BrokerAccount oldAccount = BrokerAccount.createScreenshot(user, "MIRAE", "미래에셋 메인", CLOCK);
		oldAccount.assignIdForTest(ACCOUNT_ID);
		oldAccount.touchLastSyncedAt(Clock.fixed(Instant.parse("2026-06-13T23:59:59Z"), ZoneOffset.UTC));
		when(brokerAccountRepository.findAllByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(USER_ID))
			.thenReturn(List.of(oldAccount));

		List<PortfolioSyncStatusResponse> response = service.syncStatus(USER_ID);

		assertThat(response).singleElement()
			.satisfies(status -> {
				assertThat(status.syncStatus()).isEqualTo("OUTDATED");
				assertThat(status.daysSinceSync()).isEqualTo(3);
				assertThat(status.nudgeMessage()).contains("3일 전 기준");
			});
	}

	private Holding holding(String ticker, String name, String currentValueKrw, String avgPrice, String currentPrice) {
		return Holding.create(account, new HoldingPayload(
			ticker,
			name,
			"KOSPI",
			new BigDecimal("50"),
			new BigDecimal(avgPrice),
			new BigDecimal(currentPrice),
			"KRW",
			new BigDecimal(currentValueKrw)
		), CLOCK);
	}
}
