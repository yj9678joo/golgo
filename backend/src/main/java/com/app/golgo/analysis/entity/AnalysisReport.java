package com.app.golgo.analysis.entity;

import com.app.golgo.auth.entity.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

@Getter
@Entity
@Table(name = "analysis_reports")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AnalysisReport {

	@Id
	@Generated(event = EventType.INSERT)
	@Column(insertable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false, length = 20)
	private String ticker;

	@Enumerated(EnumType.STRING)
	@Column(name = "analysis_type", nullable = false, length = 20)
	private AnalysisType analysisType;

	@Enumerated(EnumType.STRING)
	@Column(name = "llm_provider", nullable = false, length = 20)
	private LlmProvider llmProvider;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private AnalysisStatus status;

	@Column(name = "progress_pct")
	private int progressPct;

	@Column(name = "current_step", length = 30)
	private String currentStep;

	@Column(name = "investment_thesis")
	private String investmentThesis;

	@Column(name = "overall_score", precision = 4, scale = 2)
	private BigDecimal overallScore;

	@Enumerated(EnumType.STRING)
	@Column(length = 20)
	private Recommendation recommendation;

	@Column(name = "error_message")
	private String errorMessage;

	@Column(name = "requested_at", nullable = false)
	private Instant requestedAt;

	@Column(name = "generated_at")
	private Instant generatedAt;

	@OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("sectionOrder ASC")
	private List<ReportSection> sections = new ArrayList<>();

	private AnalysisReport(User user, String ticker, AnalysisType analysisType, LlmProvider llmProvider, Clock clock) {
		this.user = user;
		this.ticker = ticker;
		this.analysisType = analysisType;
		this.llmProvider = llmProvider;
		this.status = AnalysisStatus.PENDING;
		this.progressPct = 0;
		this.requestedAt = Instant.now(clock);
	}

	public static AnalysisReport createPending(
		User user,
		String ticker,
		AnalysisType analysisType,
		LlmProvider llmProvider,
		Clock clock
	) {
		return new AnalysisReport(user, ticker, analysisType, llmProvider, clock);
	}

	public void markProcessing(String currentStep, int progressPct) {
		this.status = AnalysisStatus.PROCESSING;
		this.currentStep = currentStep;
		this.progressPct = progressPct;
		this.errorMessage = null;
	}

	public void markCompleted(
		String investmentThesis,
		BigDecimal overallScore,
		Recommendation recommendation,
		Clock clock
	) {
		this.status = AnalysisStatus.COMPLETED;
		this.currentStep = null;
		this.progressPct = 100;
		this.investmentThesis = investmentThesis;
		this.overallScore = overallScore;
		this.recommendation = recommendation;
		this.errorMessage = null;
		this.generatedAt = Instant.now(clock);
	}

	public void markFailed(String errorMessage) {
		this.status = AnalysisStatus.FAILED;
		this.errorMessage = errorMessage;
	}

	public void addSection(ReportSection section) {
		boolean duplicated = sections.stream()
			.anyMatch(existing -> existing.getSectionCode() == section.getSectionCode());
		if (duplicated) {
			throw new IllegalArgumentException("sectionCode already exists in report");
		}
		sections.add(section);
	}

	public List<ReportSection> getSections() {
		return Collections.unmodifiableList(sections);
	}

	public void assignIdForTest(UUID id) {
		this.id = id;
	}
}
