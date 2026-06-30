package com.app.golgo.analysis.entity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.app.golgo.auth.entity.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class AnalysisEntityTest {

	private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-06-29T00:00:00Z"), ZoneOffset.UTC);
	private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

	@Test
	void createPendingStoresOwnerAndInitialState() {
		User user = User.createLocal("golgo01", "hash", "홍길동", "user@example.com", "투자초보", CLOCK);

		AnalysisReport report = AnalysisReport.createPending(user, "NVDA", AssetType.STOCK, AnalysisType.DEEP_INFERENCE, LlmProvider.GEMINI, CLOCK);

		assertThat(report.getUser()).isSameAs(user);
		assertThat(report.getTicker()).isEqualTo("NVDA");
		assertThat(report.getAssetType()).isEqualTo(AssetType.STOCK);
		assertThat(report.getAnalysisType()).isEqualTo(AnalysisType.DEEP_INFERENCE);
		assertThat(report.getLlmProvider()).isEqualTo(LlmProvider.GEMINI);
		assertThat(report.getStatus()).isEqualTo(AnalysisStatus.PENDING);
		assertThat(report.getProgressPct()).isZero();
		assertThat(report.getCurrentStep()).isNull();
		assertThat(report.getRequestedAt()).isEqualTo(Instant.now(CLOCK));
		assertThat(report.getGeneratedAt()).isNull();
	}

	@Test
	void progressPctUsesSmallintCompatibleJavaType() throws Exception {
		assertThat(AnalysisReport.class.getDeclaredField("progressPct").getType())
			.isEqualTo(short.class);
	}

	@Test
	void reportSectionSmallintColumnsUseCompatibleJavaTypes() throws Exception {
		assertThat(ReportSection.class.getDeclaredField("sectionOrder").getType())
			.isEqualTo(short.class);
		assertThat(ReportSection.class.getDeclaredField("score").getType())
			.isEqualTo(Short.class);
	}

	@Test
	void statusTransitionsStoreProcessingCompletedAndFailedDetails() {
		User user = User.createLocal("golgo01", "hash", "홍길동", "user@example.com", "투자초보", CLOCK);
		AnalysisReport report = AnalysisReport.createPending(user, "NVDA", AssetType.STOCK, AnalysisType.DEEP_INFERENCE, LlmProvider.GEMINI, CLOCK);

		report.markProcessing("VALUATION", 55);

		assertThat(report.getStatus()).isEqualTo(AnalysisStatus.PROCESSING);
		assertThat(report.getCurrentStep()).isEqualTo("VALUATION");
		assertThat(report.getProgressPct()).isEqualTo((short) 55);

		report.markCompleted("AI 인프라 수요가 성장 동력이다.", new BigDecimal("8.50"), Recommendation.BUY, CLOCK);

		assertThat(report.getStatus()).isEqualTo(AnalysisStatus.COMPLETED);
		assertThat(report.getInvestmentThesis()).isEqualTo("AI 인프라 수요가 성장 동력이다.");
		assertThat(report.getOverallScore()).isEqualByComparingTo("8.50");
		assertThat(report.getRecommendation()).isEqualTo(Recommendation.BUY);
		assertThat(report.getProgressPct()).isEqualTo((short) 100);
		assertThat(report.getGeneratedAt()).isEqualTo(Instant.now(CLOCK));

		report.markFailed("provider timeout");

		assertThat(report.getStatus()).isEqualTo(AnalysisStatus.FAILED);
		assertThat(report.getErrorMessage()).isEqualTo("provider timeout");
	}

	@Test
	void reportRejectsDuplicateSectionCodeWithinSameReport() {
		User user = User.createLocal("golgo01", "hash", "홍길동", "user@example.com", "투자초보", CLOCK);
		AnalysisReport report = AnalysisReport.createPending(user, "NVDA", AssetType.STOCK, AnalysisType.DEEP_INFERENCE, LlmProvider.GEMINI, CLOCK);
		report.assignIdForTest(UUID.randomUUID());
		JsonNode content = OBJECT_MAPPER.createObjectNode().put("summary", "wide moat");

		report.addSection(ReportSection.from(report, SectionCode.BUSINESS_MODEL, 1, content, 8, CLOCK));

		assertThatThrownBy(() -> report.addSection(ReportSection.from(report, SectionCode.BUSINESS_MODEL, 1, content, 9, CLOCK)))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessageContaining("sectionCode");
	}

	@Test
	void reportCanContainAllUniqueSections() {
		User user = User.createLocal("golgo01", "hash", "홍길동", "user@example.com", "투자초보", CLOCK);
		AnalysisReport report = AnalysisReport.createPending(user, "NVDA", AssetType.STOCK, AnalysisType.DEEP_INFERENCE, LlmProvider.GEMINI, CLOCK);
		JsonNode content = OBJECT_MAPPER.createObjectNode().put("summary", "ok");

		int order = 1;
		for (SectionCode sectionCode : SectionCode.values()) {
			report.addSection(ReportSection.from(report, sectionCode, order++, content, 7, CLOCK));
		}

		assertThat(report.getSections())
			.hasSize(SectionCode.values().length)
			.extracting(ReportSection::getSectionCode)
			.containsExactly(SectionCode.values());
	}
}
