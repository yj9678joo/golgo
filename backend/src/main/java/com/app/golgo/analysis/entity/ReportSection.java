package com.app.golgo.analysis.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Clock;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Generated;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.generator.EventType;
import org.hibernate.type.SqlTypes;

@Getter
@Entity
@Table(name = "report_sections")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReportSection {

	@Id
	@Generated(event = EventType.INSERT)
	@Column(insertable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "report_id", nullable = false)
	private AnalysisReport report;

	@Enumerated(EnumType.STRING)
	@Column(name = "section_code", nullable = false, length = 30)
	private SectionCode sectionCode;

	@Column(name = "section_order", nullable = false)
	private short sectionOrder;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "content_json", nullable = false, columnDefinition = "jsonb")
	private JsonNode contentJson;

	private Short score;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	private ReportSection(
		AnalysisReport report,
		SectionCode sectionCode,
		int sectionOrder,
		JsonNode contentJson,
		Integer score,
		Clock clock
	) {
		this.report = report;
		this.sectionCode = sectionCode;
		this.sectionOrder = (short) sectionOrder;
		this.contentJson = contentJson;
		this.score = score == null ? null : score.shortValue();
		this.createdAt = Instant.now(clock);
	}

	public static ReportSection from(
		AnalysisReport report,
		SectionCode sectionCode,
		int sectionOrder,
		JsonNode contentJson,
		Integer score,
		Clock clock
	) {
		return new ReportSection(report, sectionCode, sectionOrder, contentJson, score, clock);
	}
}
