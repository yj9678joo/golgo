package com.app.golgo.analysis.service;

import com.app.golgo.analysis.entity.AnalysisReport;
import com.app.golgo.analysis.entity.ReportSection;
import com.app.golgo.analysis.entity.SectionCode;
import com.app.golgo.analysis.llm.AnalysisLlmClient;
import com.app.golgo.analysis.llm.AnalysisPromptRequest;
import com.app.golgo.analysis.llm.AnalysisStructuredResult;
import com.app.golgo.analysis.repository.AnalysisReportRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Clock;
import java.util.UUID;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class AnalysisWorker {

	private final AnalysisReportRepository analysisReportRepository;
	private final AnalysisLlmClient analysisLlmClient;
	private final ObjectMapper objectMapper;
	private final Clock clock;
	private final TransactionTemplate transactionTemplate;

	public AnalysisWorker(
		AnalysisReportRepository analysisReportRepository,
		AnalysisLlmClient analysisLlmClient,
		ObjectMapper objectMapper,
		Clock clock,
		TransactionTemplate transactionTemplate
	) {
		this.analysisReportRepository = analysisReportRepository;
		this.analysisLlmClient = analysisLlmClient;
		this.objectMapper = objectMapper;
		this.clock = clock;
		this.transactionTemplate = transactionTemplate;
	}

	@Async("analysisTaskExecutor")
	public void generateAsync(UUID reportId, UUID userId) {
		AnalysisPromptRequest request = markProcessingAndCreateRequest(reportId, userId);
		try {
			AnalysisStructuredResult result = analysisLlmClient.analyze(request);
			complete(reportId, userId, result);
		} catch (AnalysisException exception) {
			markFailed(reportId, userId, exception.getMessage());
		}
	}

	private AnalysisPromptRequest markProcessingAndCreateRequest(UUID reportId, UUID userId) {
		return transactionTemplate.execute(status -> {
			AnalysisReport report = analysisReportRepository.findByIdAndUserId(reportId, userId)
				.orElseThrow(AnalysisException::notFound);
			report.markProcessing("DATA_COLLECTION", 10);
			return new AnalysisPromptRequest(
				report.getTicker(),
				report.getAssetType(),
				report.getAnalysisType(),
				report.getLlmProvider()
			);
		});
	}

	private void complete(UUID reportId, UUID userId, AnalysisStructuredResult result) {
		transactionTemplate.executeWithoutResult(status -> {
			AnalysisReport report = analysisReportRepository.findWithSectionsByIdAndUserId(reportId, userId)
				.orElseThrow(AnalysisException::notFound);
			report.markProcessing("PERSISTING_REPORT", 90);
			addSections(report, result);
			report.markCompleted(result.investmentThesis(), result.overallScore(), result.recommendation(), clock);
		});
	}

	private void markFailed(UUID reportId, UUID userId, String errorMessage) {
		transactionTemplate.executeWithoutResult(status -> {
			AnalysisReport report = analysisReportRepository.findByIdAndUserId(reportId, userId)
				.orElseThrow(AnalysisException::notFound);
			report.markFailed(errorMessage);
		});
	}

	private void addSections(AnalysisReport report, AnalysisStructuredResult result) {
		report.addSection(section(report, SectionCode.BUSINESS_MODEL, 1, result.businessModel()));
		report.addSection(section(report, SectionCode.INDUSTRY_STRUCTURE, 2, result.industryStructure()));
		report.addSection(section(report, SectionCode.FINANCIALS, 3, result.financials()));
		report.addSection(section(report, SectionCode.VALUATION, 4, result.valuation()));
		report.addSection(section(report, SectionCode.EARNINGS_CALL, 5, result.earningsCall()));
		report.addSection(section(report, SectionCode.MACRO_POLICY, 6, result.macroPolicy()));
		report.addSection(section(report, SectionCode.CATALYSTS_AND_RISKS, 7, result.catalystsAndRisks()));
	}

	private ReportSection section(AnalysisReport report, SectionCode code, int order, Object section) {
		Integer score = objectMapper.valueToTree(section).path("score").isMissingNode()
			? null
			: objectMapper.valueToTree(section).path("score").asInt();
		return ReportSection.from(report, code, order, objectMapper.valueToTree(section), score, clock);
	}
}
