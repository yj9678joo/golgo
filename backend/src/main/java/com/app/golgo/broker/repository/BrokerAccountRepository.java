package com.app.golgo.broker.repository;

import com.app.golgo.broker.entity.BrokerAccount;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrokerAccountRepository extends JpaRepository<BrokerAccount, UUID> {

	List<BrokerAccount> findAllByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID userId);

	Optional<BrokerAccount> findByIdAndUserIdAndDeletedAtIsNull(UUID id, UUID userId);
}
