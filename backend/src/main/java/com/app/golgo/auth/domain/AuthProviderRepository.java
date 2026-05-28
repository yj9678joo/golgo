package com.app.golgo.auth.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthProviderRepository extends JpaRepository<AuthProvider, UUID> {

	Optional<AuthProvider> findByProviderAndProviderId(SocialProvider provider, String providerId);

	List<AuthProvider> findAllByUserId(UUID userId);

	long countByUserId(UUID userId);

	void deleteByUserIdAndProvider(UUID userId, SocialProvider provider);
}
