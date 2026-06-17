package com.app.golgo.portfolio.controller;

import com.app.golgo.auth.security.JwtPrincipal;
import com.app.golgo.common.api.ApiResponse;
import com.app.golgo.portfolio.dto.HoldingConfirmRequest;
import com.app.golgo.portfolio.dto.HoldingEditRequest;
import com.app.golgo.portfolio.dto.ScreenshotConfirmResponse;
import com.app.golgo.portfolio.dto.ScreenshotJobResponse;
import com.app.golgo.portfolio.dto.ScreenshotUploadResponse;
import com.app.golgo.portfolio.service.PortfolioScreenshotService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/portfolio/screenshot")
public class PortfolioScreenshotController {

	private final PortfolioScreenshotService screenshotService;

	public PortfolioScreenshotController(PortfolioScreenshotService screenshotService) {
		this.screenshotService = screenshotService;
	}

	@PostMapping
	public ApiResponse<ScreenshotUploadResponse> upload(
		@AuthenticationPrincipal JwtPrincipal principal,
		@RequestParam UUID accountId,
		@RequestPart MultipartFile image
	) {
		return ApiResponse.ok(screenshotService.upload(principal.userId(), accountId, image));
	}

	@GetMapping("/{jobId}")
	public ApiResponse<ScreenshotJobResponse> job(
		@AuthenticationPrincipal JwtPrincipal principal,
		@PathVariable UUID jobId
	) {
		return ApiResponse.ok(screenshotService.getJob(principal.userId(), jobId));
	}

	@PatchMapping("/{jobId}/holdings")
	public ApiResponse<ScreenshotJobResponse> updateHoldings(
		@AuthenticationPrincipal JwtPrincipal principal,
		@PathVariable UUID jobId,
		@Valid @RequestBody HoldingEditRequest request
	) {
		return ApiResponse.ok(screenshotService.updateHoldings(principal.userId(), jobId, request));
	}

	@PostMapping("/{jobId}/confirm")
	public ApiResponse<ScreenshotConfirmResponse> confirm(
		@AuthenticationPrincipal JwtPrincipal principal,
		@PathVariable UUID jobId,
		@Valid @RequestBody HoldingConfirmRequest request
	) {
		return ApiResponse.ok(screenshotService.confirm(principal.userId(), jobId, request));
	}
}
