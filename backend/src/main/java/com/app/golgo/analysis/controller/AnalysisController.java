package com.app.golgo.analysis.controller;

import com.app.golgo.analysis.dto.AnalysisReportCreateRequest;
import com.app.golgo.analysis.dto.AnalysisReportCreateResponse;
import com.app.golgo.analysis.dto.AnalysisReportResponse;
import com.app.golgo.analysis.dto.AnalysisReportStatusResponse;
import com.app.golgo.analysis.dto.AnalysisReportSummaryResponse;
import com.app.golgo.analysis.service.AnalysisService;
import com.app.golgo.auth.security.JwtPrincipal;
import com.app.golgo.common.api.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analysis/reports")
public class AnalysisController {

	private final AnalysisService analysisService;

	public AnalysisController(AnalysisService analysisService) {
		this.analysisService = analysisService;
	}

	@PostMapping
	public ResponseEntity<ApiResponse<AnalysisReportCreateResponse>> create(
		@AuthenticationPrincipal JwtPrincipal principal,
		@Valid @RequestBody AnalysisReportCreateRequest request
	) {
		return ResponseEntity.accepted().body(ApiResponse.ok(analysisService.createReport(principal.userId(), request)));
	}

	@GetMapping("/{reportId}")
	public ApiResponse<AnalysisReportResponse> detail(
		@AuthenticationPrincipal JwtPrincipal principal,
		@PathVariable UUID reportId
	) {
		return ApiResponse.ok(analysisService.detail(principal.userId(), reportId));
	}

	@GetMapping
	public ApiResponse<List<AnalysisReportSummaryResponse>> list(@AuthenticationPrincipal JwtPrincipal principal) {
		return ApiResponse.ok(analysisService.list(principal.userId()));
	}

	@GetMapping("/{reportId}/status")
	public ApiResponse<AnalysisReportStatusResponse> status(
		@AuthenticationPrincipal JwtPrincipal principal,
		@PathVariable UUID reportId
	) {
		return ApiResponse.ok(analysisService.status(principal.userId(), reportId));
	}
}
