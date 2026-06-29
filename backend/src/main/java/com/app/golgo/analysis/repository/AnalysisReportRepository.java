package com.app.golgo.analysis.repository;

import com.app.golgo.analysis.entity.AnalysisReport;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnalysisReportRepository extends JpaRepository<AnalysisReport, UUID> {

	List<AnalysisReport> findAllByUserIdOrderByRequestedAtDesc(UUID userId);

	Optional<AnalysisReport> findByIdAndUserId(UUID id, UUID userId);

	@EntityGraph(attributePaths = "sections")
	Optional<AnalysisReport> findWithSectionsByIdAndUserId(UUID id, UUID userId);
}
