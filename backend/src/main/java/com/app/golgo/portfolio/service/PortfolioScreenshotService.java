package com.app.golgo.portfolio.service;

import com.app.golgo.broker.entity.BrokerAccount;
import com.app.golgo.broker.entity.BrokerConnectionType;
import com.app.golgo.broker.service.BrokerService;
import com.app.golgo.portfolio.dto.HoldingConfirmRequest;
import com.app.golgo.portfolio.dto.HoldingEditRequest;
import com.app.golgo.portfolio.dto.HoldingPayload;
import com.app.golgo.portfolio.dto.ParsedHoldingResponse;
import com.app.golgo.portfolio.dto.ScreenshotConfirmResponse;
import com.app.golgo.portfolio.dto.ScreenshotJobResponse;
import com.app.golgo.portfolio.dto.ScreenshotUploadResponse;
import com.app.golgo.portfolio.entity.Holding;
import com.app.golgo.portfolio.entity.PortfolioScreenshot;
import com.app.golgo.portfolio.entity.ScreenshotStatus;
import com.app.golgo.portfolio.parser.ParsedHolding;
import com.app.golgo.portfolio.parser.ParsedPortfolio;
import com.app.golgo.portfolio.parser.ScreenshotParser;
import com.app.golgo.portfolio.repository.HoldingRepository;
import com.app.golgo.portfolio.repository.PortfolioScreenshotRepository;
import com.app.golgo.portfolio.storage.ScreenshotStorage;
import com.app.golgo.portfolio.storage.StoredScreenshot;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.Clock;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PortfolioScreenshotService {

	private static final long MAX_IMAGE_BYTES = 10L * 1024L * 1024L;
	private static final TypeReference<List<HoldingPayload>> HOLDINGS_TYPE = new TypeReference<>() {
	};
	private static final TypeReference<List<String>> WARNINGS_TYPE = new TypeReference<>() {
	};

	private final BrokerService brokerService;
	private final PortfolioScreenshotRepository screenshotRepository;
	private final HoldingRepository holdingRepository;
	private final ScreenshotStorage storage;
	private final ScreenshotParser parser;
	private final ObjectMapper objectMapper;
	private final Clock clock;

	public PortfolioScreenshotService(
		BrokerService brokerService,
		PortfolioScreenshotRepository screenshotRepository,
		HoldingRepository holdingRepository,
		ScreenshotStorage storage,
		ScreenshotParser parser,
		ObjectMapper objectMapper,
		Clock clock
	) {
		this.brokerService = brokerService;
		this.screenshotRepository = screenshotRepository;
		this.holdingRepository = holdingRepository;
		this.storage = storage;
		this.parser = parser;
		this.objectMapper = objectMapper;
		this.clock = clock;
	}

	@Transactional
	public ScreenshotUploadResponse upload(UUID userId, UUID accountId, MultipartFile image) {
		validateImage(image);
		BrokerAccount account = brokerService.findActiveAccountForUser(userId, accountId);
		if (account.getConnectionType() != BrokerConnectionType.SCREENSHOT) {
			throw new ScreenshotException(HttpStatus.BAD_REQUEST, "SCREENSHOT_008", "캡처 방식 계좌만 업로드할 수 있습니다.");
		}

		StoredScreenshot stored = storage.store(userId, image);
		PortfolioScreenshot screenshot = screenshotRepository.saveAndFlush(PortfolioScreenshot.processing(
			account.getUser(),
			account,
			stored.path(),
			clock
		));

		try {
			ParsedPortfolio parsed = parser.parse(stored.absolutePath());
			List<HoldingPayload> holdings = normalize(parsed.holdings().stream()
				.map(this::toPayload)
				.toList());
			screenshot.complete(
				objectMapper.valueToTree(holdings),
				parsed.confidence(),
				totalAssetKrw(holdings),
				objectMapper.valueToTree(parsed.warnings()),
				clock
			);
		} catch (RuntimeException exception) {
			screenshot.fail("PARSE_ERROR", clock);
		} finally {
			storage.delete(stored);
		}

		return new ScreenshotUploadResponse(screenshot.getId(), screenshot.getStatus().name(), 10);
	}

	@Transactional(readOnly = true)
	public ScreenshotJobResponse getJob(UUID userId, UUID jobId) {
		return toJobResponse(findJob(userId, jobId));
	}

	@Transactional
	public ScreenshotJobResponse updateHoldings(UUID userId, UUID jobId, HoldingEditRequest request) {
		PortfolioScreenshot screenshot = findJob(userId, jobId);
		if (screenshot.getStatus() == ScreenshotStatus.CONFIRMED) {
			throw new ScreenshotException(HttpStatus.BAD_REQUEST, "SCREENSHOT_005", "이미 confirm된 작업은 수정할 수 없습니다.");
		}
		if (screenshot.getStatus() == ScreenshotStatus.FAILED || screenshot.getStatus() == ScreenshotStatus.PROCESSING) {
			throw new ScreenshotException(HttpStatus.BAD_REQUEST, "SCREENSHOT_004", "수정할 수 없는 파싱 작업입니다.");
		}

		List<HoldingPayload> holdings = normalize(request.holdings());
		screenshot.updateEditedHoldings(objectMapper.valueToTree(holdings), totalAssetKrw(holdings));
		return toJobResponse(screenshot);
	}

	@Transactional
	public ScreenshotConfirmResponse confirm(UUID userId, UUID jobId, HoldingConfirmRequest request) {
		PortfolioScreenshot screenshot = findJob(userId, jobId);
		if (screenshot.getStatus() == ScreenshotStatus.CONFIRMED) {
			throw new ScreenshotException(HttpStatus.BAD_REQUEST, "SCREENSHOT_005", "이미 confirm된 작업은 수정할 수 없습니다.");
		}
		if (screenshot.getStatus() == ScreenshotStatus.FAILED || screenshot.getStatus() == ScreenshotStatus.PROCESSING) {
			throw new ScreenshotException(HttpStatus.BAD_REQUEST, "SCREENSHOT_004", "저장할 수 없는 파싱 작업입니다.");
		}

		List<HoldingPayload> holdings = normalize(request.confirmedHoldings());
		BrokerAccount account = screenshot.getBrokerAccount();
		holdingRepository.deleteAllByBrokerAccountId(account.getId());
		holdingRepository.saveAll(holdings.stream()
			.map(payload -> Holding.create(account, payload, clock))
			.toList());
		account.touchLastSyncedAt(clock);
		screenshot.updateEditedHoldings(objectMapper.valueToTree(holdings), totalAssetKrw(holdings));
		screenshot.confirm(clock);

		return new ScreenshotConfirmResponse(screenshot.getId(), screenshot.getStatus().name(), holdings.size(), screenshot.getConfirmedAt());
	}

	private PortfolioScreenshot findJob(UUID userId, UUID jobId) {
		return screenshotRepository.findByIdAndUserId(jobId, userId)
			.orElseThrow(() -> new ScreenshotException(HttpStatus.NOT_FOUND, "SCREENSHOT_004", "파싱 작업을 찾을 수 없습니다."));
	}

	private ScreenshotJobResponse toJobResponse(PortfolioScreenshot screenshot) {
		List<HoldingPayload> holdings = readHoldings(screenshot.currentHoldingsJson());
		List<ParsedHoldingResponse> holdingResponses = holdings.stream()
			.map(holding -> ParsedHoldingResponse.from(holding, screenshot.isManuallyEdited()))
			.toList();
		List<String> warnings = readWarnings(screenshot.getWarningsJson());

		String message = null;
		if (screenshot.getStatus() == ScreenshotStatus.FAILED) {
			message = "이미지에서 보유 종목을 인식할 수 없습니다. 캡처 화면을 확인해 주세요.";
		}

		return new ScreenshotJobResponse(
			screenshot.getId(),
			screenshot.getStatus().name(),
			screenshot.getBrokerCode(),
			screenshot.getBrokerAccount().getAccountNickname(),
			screenshot.getCompletedAt(),
			screenshot.getConfirmedAt(),
			screenshot.getConfidence(),
			holdingResponses,
			screenshot.getTotalAssetKrw(),
			warnings,
			screenshot.getErrorReason(),
			message,
			10
		);
	}

	private void validateImage(MultipartFile image) {
		if (image == null || image.isEmpty()) {
			throw new ScreenshotException(HttpStatus.BAD_REQUEST, "SCREENSHOT_001", "이미지 파일을 선택해 주세요.");
		}
		if (image.getSize() > MAX_IMAGE_BYTES) {
			throw new ScreenshotException(HttpStatus.BAD_REQUEST, "SCREENSHOT_002", "이미지 파일 크기는 10MB 이하여야 합니다.");
		}
		String contentType = image.getContentType();
		if (!"image/png".equals(contentType) && !"image/jpeg".equals(contentType)) {
			throw new ScreenshotException(HttpStatus.BAD_REQUEST, "SCREENSHOT_001", "지원하지 않는 이미지 형식입니다.");
		}
	}

	private HoldingPayload toPayload(ParsedHolding holding) {
		return new HoldingPayload(
			holding.ticker(),
			holding.name(),
			holding.market(),
			holding.quantity(),
			holding.avgPrice(),
			holding.currentPrice(),
			holding.currency(),
			holding.currentValueKrw()
		);
	}

	private List<HoldingPayload> normalize(List<HoldingPayload> holdings) {
		List<HoldingPayload> normalized = holdings.stream()
			.map(HoldingPayload::normalized)
			.toList();
		Set<String> tickers = new HashSet<>();
		for (HoldingPayload holding : normalized) {
			if (!holding.ticker().isBlank() && !tickers.add(holding.ticker())) {
				throw new ScreenshotException(HttpStatus.BAD_REQUEST, "SCREENSHOT_006", "중복된 종목 코드가 있습니다.");
			}
		}
		return normalized;
	}

	private BigDecimal totalAssetKrw(List<HoldingPayload> holdings) {
		return holdings.stream()
			.map(HoldingPayload::currentValueKrw)
			.reduce(BigDecimal.ZERO, BigDecimal::add);
	}

	private List<HoldingPayload> readHoldings(JsonNode jsonNode) {
		if (jsonNode == null || jsonNode.isNull()) {
			return List.of();
		}
		return objectMapper.convertValue(jsonNode, HOLDINGS_TYPE);
	}

	private List<String> readWarnings(JsonNode jsonNode) {
		if (jsonNode == null || jsonNode.isNull()) {
			return List.of();
		}
		return objectMapper.convertValue(jsonNode, WARNINGS_TYPE);
	}
}
