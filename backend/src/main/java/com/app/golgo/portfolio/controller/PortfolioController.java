package com.app.golgo.portfolio.controller;

import com.app.golgo.auth.security.JwtPrincipal;
import com.app.golgo.common.api.ApiResponse;
import com.app.golgo.portfolio.dto.PortfolioDashboardResponse;
import com.app.golgo.portfolio.dto.PortfolioHistoryResponse;
import com.app.golgo.portfolio.dto.PortfolioSyncStatusResponse;
import com.app.golgo.portfolio.service.PortfolioService;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/portfolio")
public class PortfolioController {

	private final PortfolioService portfolioService;

	public PortfolioController(PortfolioService portfolioService) {
		this.portfolioService = portfolioService;
	}

	@GetMapping
	public ApiResponse<PortfolioDashboardResponse> dashboard(@AuthenticationPrincipal JwtPrincipal principal) {
		return ApiResponse.ok(portfolioService.dashboard(principal.userId()));
	}

	@GetMapping("/history")
	public ApiResponse<PortfolioHistoryResponse> history(
		@AuthenticationPrincipal JwtPrincipal principal,
		@RequestParam(required = false) String period
	) {
		return ApiResponse.ok(portfolioService.history(principal.userId(), period));
	}

	@GetMapping("/accounts/sync-status")
	public ApiResponse<List<PortfolioSyncStatusResponse>> syncStatus(@AuthenticationPrincipal JwtPrincipal principal) {
		return ApiResponse.ok(portfolioService.syncStatus(principal.userId()));
	}
}
