package com.app.golgo.analysis.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.app.golgo.analysis.dto.AnalysisReportCreateRequest;
import com.app.golgo.analysis.dto.AnalysisReportCreateResponse;
import com.app.golgo.analysis.dto.AnalysisReportStatusResponse;
import com.app.golgo.analysis.entity.AnalysisType;
import com.app.golgo.analysis.entity.LlmProvider;
import com.app.golgo.analysis.service.AnalysisService;
import com.app.golgo.auth.security.JwtPrincipal;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class AnalysisControllerTest {

	private static final UUID USER_ID = UUID.fromString("018f0000-0000-7000-8000-000000000001");
	private static final UUID REPORT_ID = UUID.fromString("018f0000-0000-7000-8000-000000000101");

	@Test
	void createReportReturnsAcceptedApiResponse() {
		AnalysisService service = org.mockito.Mockito.mock(AnalysisService.class);
		AnalysisController controller = new AnalysisController(service);
		AnalysisReportCreateRequest request = new AnalysisReportCreateRequest(
			"NVDA",
			AnalysisType.DEEP_INFERENCE,
			LlmProvider.GEMINI
		);
		when(service.createReport(USER_ID, request)).thenReturn(new AnalysisReportCreateResponse(
			REPORT_ID,
			"PROCESSING",
			45
		));

		var response = controller.create(new JwtPrincipal(USER_ID, Instant.now()), request);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.ACCEPTED);
		assertThat(response.getBody().success()).isTrue();
		assertThat(response.getBody().data().reportId()).isEqualTo(REPORT_ID);
	}

	@Test
	void statusDelegatesToServiceForAuthenticatedUser() {
		AnalysisService service = org.mockito.Mockito.mock(AnalysisService.class);
		AnalysisController controller = new AnalysisController(service);
		when(service.status(USER_ID, REPORT_ID)).thenReturn(new AnalysisReportStatusResponse(
			REPORT_ID,
			"PROCESSING",
			60,
			"VALUATION"
		));

		var response = controller.status(new JwtPrincipal(USER_ID, Instant.now()), REPORT_ID);

		assertThat(response.data().currentStep()).isEqualTo("VALUATION");
	}
}
