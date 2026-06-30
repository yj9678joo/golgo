package com.app.golgo.analysis.repository;

import com.app.golgo.analysis.entity.AnalysisReport;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AnalysisReportRepository extends JpaRepository<AnalysisReport, UUID> {

	List<AnalysisReport> findAllByUserIdOrderByRequestedAtDesc(UUID userId);

	Optional<AnalysisReport> findByIdAndUserId(UUID id, UUID userId);

	@EntityGraph(attributePaths = "sections")
	@Query("select report from AnalysisReport report where report.id = :id and report.user.id = :userId")
	Optional<AnalysisReport> findWithSectionsByIdAndUserId(UUID id, UUID userId);
}
