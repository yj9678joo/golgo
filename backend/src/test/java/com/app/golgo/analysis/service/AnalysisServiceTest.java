package com.app.golgo.analysis.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.app.golgo.analysis.dto.AnalysisReportCreateRequest;
import com.app.golgo.analysis.dto.AnalysisReportCreateResponse;
import com.app.golgo.analysis.dto.AnalysisReportResponse;
import com.app.golgo.analysis.dto.AnalysisReportStatusResponse;
import com.app.golgo.analysis.entity.AnalysisReport;
import com.app.golgo.analysis.entity.AnalysisType;
import com.app.golgo.analysis.entity.LlmProvider;
import com.app.golgo.analysis.entity.Recommendation;
import com.app.golgo.analysis.entity.ReportSection;
import com.app.golgo.analysis.entity.SectionCode;
import com.app.golgo.analysis.repository.AnalysisReportRepository;
import com.app.golgo.auth.entity.User;
import com.app.golgo.auth.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
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
class AnalysisServiceTest {

	private static final UUID USER_ID = UUID.fromString("018f0000-0000-7000-8000-000000000001");
	private static final UUID REPORT_ID = UUID.fromString("018f0000-0000-7000-8000-000000000101");
	private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-06-29T00:00:00Z"), ZoneOffset.UTC);

	@Mock
	private UserRepository userRepository;

	@Mock
	private AnalysisReportRepository analysisReportRepository;

	@Mock
	private AnalysisWorker analysisWorker;

	private AnalysisService service;
	private User user;

	@BeforeEach
	void setUp() {
		service = new AnalysisService(userRepository, analysisReportRepository, analysisWorker, CLOCK);
		user = User.createLocal("golgo01", "hash", "홍길동", "user@example.com", "투자초보", CLOCK);
		user.assignIdForTest(USER_ID);
	}

	@Test
	void createReportPersistsPendingReportAndTriggersAsyncWorker() {
		when(userRepository.findByIdAndDeletedAtIsNull(USER_ID)).thenReturn(Optional.of(user));
		when(analysisReportRepository.save(org.mockito.ArgumentMatchers.any(AnalysisReport.class))).thenAnswer(invocation -> {
			AnalysisReport report = invocation.getArgument(0);
			report.assignIdForTest(REPORT_ID);
			return report;
		});

		AnalysisReportCreateResponse response = service.createReport(USER_ID, new AnalysisReportCreateRequest(
			" nvda ",
			AnalysisType.DEEP_INFERENCE,
			LlmProvider.GEMINI
		));

		assertThat(response.reportId()).isEqualTo(REPORT_ID);
		assertThat(response.status()).isEqualTo("PROCESSING");
		assertThat(response.estimatedSeconds()).isEqualTo(45);
		verify(analysisWorker).generateAsync(REPORT_ID, USER_ID);
	}

	@Test
	void statusReturnsProgressForOwnedReport() {
		AnalysisReport report = AnalysisReport.createPending(user, "NVDA", AnalysisType.DEEP_INFERENCE, LlmProvider.GEMINI, CLOCK);
		report.assignIdForTest(REPORT_ID);
		report.markProcessing("VALUATION", 60);
		when(analysisReportRepository.findByIdAndUserId(REPORT_ID, USER_ID)).thenReturn(Optional.of(report));

		AnalysisReportStatusResponse response = service.status(USER_ID, REPORT_ID);

		assertThat(response.reportId()).isEqualTo(REPORT_ID);
		assertThat(response.status()).isEqualTo("PROCESSING");
		assertThat(response.progressPct()).isEqualTo(60);
		assertThat(response.currentStep()).isEqualTo("VALUATION");
	}

	@Test
	void detailRejectsReportOwnedByAnotherUser() {
		when(analysisReportRepository.findWithSectionsByIdAndUserId(REPORT_ID, USER_ID)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.detail(USER_ID, REPORT_ID))
			.isInstanceOf(AnalysisException.class)
			.extracting(error -> ((AnalysisException) error).status(), error -> ((AnalysisException) error).code())
			.containsExactly(org.springframework.http.HttpStatus.NOT_FOUND, "ANALYSIS_001");
	}

	@Test
	void detailReturnsCompletedReportWithSevenSections() {
		AnalysisReport report = AnalysisReport.createPending(user, "NVDA", AnalysisType.DEEP_INFERENCE, LlmProvider.GEMINI, CLOCK);
		report.assignIdForTest(REPORT_ID);
		int order = 1;
		for (SectionCode sectionCode : SectionCode.values()) {
			report.addSection(ReportSection.from(
				report,
				sectionCode,
				order++,
				new ObjectMapper().createObjectNode().put("summary", sectionCode.name()),
				7,
				CLOCK
			));
		}
		report.markCompleted("AI 인프라 독점력", new BigDecimal("7.40"), Recommendation.HOLD, CLOCK);
		when(analysisReportRepository.findWithSectionsByIdAndUserId(REPORT_ID, USER_ID)).thenReturn(Optional.of(report));

		AnalysisReportResponse response = service.detail(USER_ID, REPORT_ID);

		assertThat(response.reportId()).isEqualTo(REPORT_ID);
		assertThat(response.sections()).hasSize(7);
		assertThat(response.recommendation()).isEqualTo("HOLD");
	}

	@Test
	void listIncludesAnalysisTypeAndProviderForFrontendSummary() {
		AnalysisReport report = AnalysisReport.createPending(user, "NVDA", AnalysisType.DEEP_INFERENCE, LlmProvider.GEMINI, CLOCK);
		report.assignIdForTest(REPORT_ID);
		when(analysisReportRepository.findAllByUserIdOrderByRequestedAtDesc(USER_ID)).thenReturn(java.util.List.of(report));

		var response = service.list(USER_ID);

		assertThat(response).singleElement()
			.satisfies(summary -> {
				assertThat(summary.analysisType()).isEqualTo("DEEP_INFERENCE");
				assertThat(summary.llmProvider()).isEqualTo("GEMINI");
			});
	}
}
