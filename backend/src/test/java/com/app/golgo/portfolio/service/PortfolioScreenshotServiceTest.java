package com.app.golgo.portfolio.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.app.golgo.auth.entity.User;
import com.app.golgo.broker.entity.BrokerAccount;
import com.app.golgo.broker.service.BrokerService;
import com.app.golgo.portfolio.dto.HoldingConfirmRequest;
import com.app.golgo.portfolio.dto.HoldingPayload;
import com.app.golgo.portfolio.dto.ScreenshotConfirmResponse;
import com.app.golgo.portfolio.dto.ScreenshotUploadResponse;
import com.app.golgo.portfolio.entity.PortfolioScreenshot;
import com.app.golgo.portfolio.parser.ParsedPortfolio;
import com.app.golgo.portfolio.parser.ParsedHolding;
import com.app.golgo.portfolio.parser.ScreenshotParser;
import com.app.golgo.portfolio.repository.HoldingRepository;
import com.app.golgo.portfolio.repository.PortfolioScreenshotRepository;
import com.app.golgo.portfolio.storage.ScreenshotStorage;
import com.app.golgo.portfolio.storage.StoredScreenshot;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

@ExtendWith(MockitoExtension.class)
class PortfolioScreenshotServiceTest {

	private static final UUID USER_ID = UUID.fromString("018f0000-0000-7000-8000-000000000001");
	private static final UUID ACCOUNT_ID = UUID.fromString("018f0000-0000-7000-8000-000000000002");
	private static final UUID JOB_ID = UUID.fromString("018f0000-0000-7000-8000-000000000003");
	private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-06-17T00:00:00Z"), ZoneOffset.UTC);

	@Mock
	private BrokerService brokerService;

	@Mock
	private PortfolioScreenshotRepository screenshotRepository;

	@Mock
	private HoldingRepository holdingRepository;

	@Mock
	private ScreenshotStorage storage;

	@Mock
	private ScreenshotParser parser;

	private ObjectMapper objectMapper;
	private PortfolioScreenshotService service;
	private User user;
	private BrokerAccount account;

	@BeforeEach
	void setUp() {
		objectMapper = new ObjectMapper();
		service = new PortfolioScreenshotService(
			brokerService,
			screenshotRepository,
			holdingRepository,
			storage,
			parser,
			objectMapper,
			CLOCK
		);
		user = User.createLocal("golgo01", "hash", "홍길동", "user@example.com", "투자초보", CLOCK);
		user.assignIdForTest(USER_ID);
		account = BrokerAccount.createScreenshot(user, "MIRAE", "미래에셋 메인", CLOCK);
		account.assignIdForTest(ACCOUNT_ID);
	}

	@Test
	void uploadRejectsNonImageFile() {
		MockMultipartFile file = new MockMultipartFile("image", "note.txt", "text/plain", "hello".getBytes(StandardCharsets.UTF_8));

		Throwable thrown = catchThrowable(() -> service.upload(USER_ID, ACCOUNT_ID, file));

		assertThat(thrown)
			.isInstanceOf(ScreenshotException.class)
			.hasMessage("지원하지 않는 이미지 형식입니다.")
			.extracting(error -> ((ScreenshotException) error).code())
			.isEqualTo("SCREENSHOT_001");
	}

	@Test
	void uploadStoresParsedCompletedJob() {
		MockMultipartFile file = new MockMultipartFile("image", "mts.png", "image/png", new byte[] {1, 2, 3});
		when(brokerService.findActiveAccountForUser(USER_ID, ACCOUNT_ID)).thenReturn(account);
		when(storage.store(USER_ID, file)).thenReturn(new StoredScreenshot("user/mts.png", Path.of("D:/tmp/mts.png")));
		when(parser.parse(Path.of("D:/tmp/mts.png"))).thenReturn(ParsedPortfolio.sample());
		when(screenshotRepository.saveAndFlush(any(PortfolioScreenshot.class))).thenAnswer(invocation -> {
			PortfolioScreenshot screenshot = invocation.getArgument(0);
			screenshot.assignIdForTest(JOB_ID);
			return screenshot;
		});

		ScreenshotUploadResponse response = service.upload(USER_ID, ACCOUNT_ID, file);

		assertThat(response.jobId()).isEqualTo(JOB_ID);
		assertThat(response.status()).isEqualTo("COMPLETED");
	}

	@Test
	void uploadAllowsMissingTickersForManualReview() {
		MockMultipartFile file = new MockMultipartFile("image", "mts.png", "image/png", new byte[] {1, 2, 3});
		when(brokerService.findActiveAccountForUser(USER_ID, ACCOUNT_ID)).thenReturn(account);
		when(storage.store(USER_ID, file)).thenReturn(new StoredScreenshot("user/mts.png", Path.of("D:/tmp/mts.png")));
		when(parser.parse(Path.of("D:/tmp/mts.png"))).thenReturn(new ParsedPortfolio(
			List.of(parsedHolding("ETF A"), parsedHolding("ETF B")),
			new BigDecimal("0.9"),
			List.of("종목 코드를 확인해 주세요.")
		));
		when(screenshotRepository.saveAndFlush(any(PortfolioScreenshot.class))).thenAnswer(invocation -> {
			PortfolioScreenshot screenshot = invocation.getArgument(0);
			screenshot.assignIdForTest(JOB_ID);
			return screenshot;
		});

		ScreenshotUploadResponse response = service.upload(USER_ID, ACCOUNT_ID, file);

		assertThat(response.status()).isEqualTo("COMPLETED");
	}

	@Test
	void confirmReplacesAccountHoldingsAndMarksJobConfirmed() {
		PortfolioScreenshot screenshot = completedScreenshot();
		when(screenshotRepository.findByIdAndUserId(JOB_ID, USER_ID)).thenReturn(Optional.of(screenshot));

		ScreenshotConfirmResponse response = service.confirm(
			USER_ID,
			JOB_ID,
			new HoldingConfirmRequest(List.of(holding("55")), new BigDecimal("3960000"))
		);

		verify(holdingRepository).deleteAllByBrokerAccountId(ACCOUNT_ID);
		verify(holdingRepository).saveAll(anyList());
		assertThat(response.status()).isEqualTo("CONFIRMED");
		assertThat(response.savedHoldingsCount()).isEqualTo(1);
		assertThat(screenshot.getTotalAssetKrw()).isEqualByComparingTo("4000000");
	}

	@Test
	void confirmRejectsAlreadyConfirmedJob() {
		PortfolioScreenshot screenshot = completedScreenshot();
		screenshot.confirm(CLOCK);
		when(screenshotRepository.findByIdAndUserId(JOB_ID, USER_ID)).thenReturn(Optional.of(screenshot));

		Throwable thrown = catchThrowable(() -> service.confirm(
			USER_ID,
			JOB_ID,
			new HoldingConfirmRequest(List.of(holding("55")), new BigDecimal("3960000"))
		));

		assertThat(thrown)
			.isInstanceOf(ScreenshotException.class)
			.extracting(error -> ((ScreenshotException) error).code())
			.isEqualTo("SCREENSHOT_005");
	}

	@Test
	void confirmAcceptsUsdHoldingWithDisplayedKrwValue() {
		PortfolioScreenshot screenshot = completedScreenshot();
		when(screenshotRepository.findByIdAndUserId(JOB_ID, USER_ID)).thenReturn(Optional.of(screenshot));

		ScreenshotConfirmResponse response = service.confirm(
			USER_ID,
			JOB_ID,
			new HoldingConfirmRequest(List.of(holding("2", "USD", "410000")), new BigDecimal("410000"))
		);

		assertThat(response.status()).isEqualTo("CONFIRMED");
		assertThat(screenshot.getTotalAssetKrw()).isEqualByComparingTo("410000");
	}

	private PortfolioScreenshot completedScreenshot() {
		PortfolioScreenshot screenshot = PortfolioScreenshot.processing(user, account, "user/mts.png", CLOCK);
		screenshot.assignIdForTest(JOB_ID);
		screenshot.complete(
			objectMapper.valueToTree(List.of(holding("50"))),
			new BigDecimal("0.970"),
			new BigDecimal("3600000"),
			objectMapper.valueToTree(List.of("샘플 파싱 결과입니다.")),
			CLOCK
		);
		return screenshot;
	}

	private HoldingPayload holding(String quantity) {
		return holding(quantity, "KRW", "4000000");
	}

	private HoldingPayload holding(String quantity, String currency, String currentValueKrw) {
		return new HoldingPayload(
			"005930",
			"삼성전자",
			"KOSPI",
			new BigDecimal(quantity),
			new BigDecimal("68000"),
			new BigDecimal("72000"),
			currency,
			new BigDecimal(currentValueKrw)
		);
	}

	private ParsedHolding parsedHolding(String name) {
		return new ParsedHolding(
			"",
			name,
			"KOSPI",
			BigDecimal.ONE,
			new BigDecimal("1000"),
			new BigDecimal("1100"),
			"KRW",
			new BigDecimal("1100")
		);
	}
}
