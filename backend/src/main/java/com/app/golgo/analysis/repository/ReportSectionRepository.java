package com.app.golgo.analysis.repository;

import com.app.golgo.analysis.entity.ReportSection;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportSectionRepository extends JpaRepository<ReportSection, UUID> {
}
