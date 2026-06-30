package com.app.golgo.analysis.service;

import com.app.golgo.analysis.dto.AnalysisReportCreateRequest;
import com.app.golgo.analysis.dto.AnalysisReportCreateResponse;
import com.app.golgo.analysis.dto.AnalysisReportResponse;
import com.app.golgo.analysis.dto.AnalysisReportStatusResponse;
import com.app.golgo.analysis.dto.AnalysisReportSummaryResponse;
import com.app.golgo.analysis.entity.AnalysisReport;
import com.app.golgo.analysis.entity.AnalysisType;
import com.app.golgo.analysis.entity.LlmProvider;
import com.app.golgo.analysis.entity.ReportSection;
import com.app.golgo.analysis.repository.AnalysisReportRepository;
import com.app.golgo.auth.entity.User;
import com.app.golgo.auth.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.Clock;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalysisService {

	private static final int ESTIMATED_ANALYSIS_SECONDS = 120;

	private final UserRepository userRepository;
	private final AnalysisReportRepository analysisReportRepository;
	private final AnalysisWorker analysisWorker;
	private final Clock clock;

	public AnalysisService(
		UserRepository userRepository,
		AnalysisReportRepository analysisReportRepository,
		AnalysisWorker analysisWorker,
		Clock clock
	) {
		this.userRepository = userRepository;
		this.analysisReportRepository = analysisReportRepository;
		this.analysisWorker = analysisWorker;
		this.clock = clock;
	}

	@Transactional
	public AnalysisReportCreateResponse createReport(UUID userId, AnalysisReportCreateRequest request) {
		User user = userRepository.findByIdAndDeletedAtIsNull(userId)
			.orElseThrow(AnalysisException::notFound);
		AnalysisReport report = AnalysisReport.createPending(
			user,
			request.ticker().trim().toUpperCase(),
			request.assetType(),
			request.analysisType() == null ? AnalysisType.DEEP_INFERENCE : request.analysisType(),
			request.llmProvider() == null ? LlmProvider.GEMINI : request.llmProvider(),
			clock
		);
		AnalysisReport saved = analysisReportRepository.save(report);
		analysisWorker.generateAsync(saved.getId(), userId);
		return new AnalysisReportCreateResponse(saved.getId(), "PROCESSING", ESTIMATED_ANALYSIS_SECONDS);
	}

	@Transactional(readOnly = true)
	public AnalysisReportStatusResponse status(UUID userId, UUID reportId) {
		AnalysisReport report = analysisReportRepository.findByIdAndUserId(reportId, userId)
			.orElseThrow(AnalysisException::notFound);
		return new AnalysisReportStatusResponse(
			report.getId(),
			report.getStatus().name(),
			report.getProgressPct(),
			report.getCurrentStep()
		);
	}

	@Transactional(readOnly = true)
	public AnalysisReportResponse detail(UUID userId, UUID reportId) {
		AnalysisReport report = analysisReportRepository.findWithSectionsByIdAndUserId(reportId, userId)
			.orElseThrow(AnalysisException::notFound);
		Map<String, JsonNode> sections = new LinkedHashMap<>();
		for (ReportSection section : report.getSections()) {
			sections.put(toResponseKey(section), section.getContentJson());
		}
		return new AnalysisReportResponse(
			report.getId(),
			report.getTicker(),
			report.getAssetType().name(),
			report.getStatus().name(),
			report.getGeneratedAt(),
			sections,
			report.getInvestmentThesis(),
			report.getOverallScore(),
			report.getRecommendation() == null ? null : report.getRecommendation().name()
		);
	}

	@Transactional(readOnly = true)
	public List<AnalysisReportSummaryResponse> list(UUID userId) {
		return analysisReportRepository.findAllByUserIdOrderByRequestedAtDesc(userId).stream()
			.map(report -> new AnalysisReportSummaryResponse(
				report.getId(),
				report.getTicker(),
				report.getAssetType().name(),
				report.getAnalysisType().name(),
				report.getLlmProvider().name(),
				report.getStatus().name(),
				report.getOverallScore(),
				report.getRecommendation() == null ? null : report.getRecommendation().name(),
				report.getRequestedAt(),
				report.getGeneratedAt()
			))
			.toList();
	}

	private String toResponseKey(ReportSection section) {
		return switch (section.getSectionCode()) {
			case BUSINESS_MODEL -> "businessModel";
			case INDUSTRY_STRUCTURE -> "industryStructure";
			case FINANCIALS -> "financials";
			case VALUATION -> "valuation";
			case EARNINGS_CALL -> "earningsCall";
			case MACRO_POLICY -> "macroPolicy";
			case CATALYSTS_AND_RISKS -> "catalystsAndRisks";
		};
	}
}
