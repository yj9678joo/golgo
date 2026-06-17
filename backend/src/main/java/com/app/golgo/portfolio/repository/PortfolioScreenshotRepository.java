package com.app.golgo.portfolio.repository;

import com.app.golgo.portfolio.entity.PortfolioScreenshot;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioScreenshotRepository extends JpaRepository<PortfolioScreenshot, UUID> {

	Optional<PortfolioScreenshot> findByIdAndUserId(UUID id, UUID userId);
}
