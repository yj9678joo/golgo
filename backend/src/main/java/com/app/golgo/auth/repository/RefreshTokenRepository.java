package com.app.golgo.auth.repository;

import com.app.golgo.auth.entity.RefreshToken;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

	boolean existsByTokenHash(String tokenHash);

	void deleteByTokenHash(String tokenHash);

	void deleteAllByUserId(UUID userId);
}
