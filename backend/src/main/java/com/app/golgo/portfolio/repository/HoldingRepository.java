package com.app.golgo.portfolio.repository;

import com.app.golgo.portfolio.entity.Holding;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HoldingRepository extends JpaRepository<Holding, UUID> {

	@Modifying
	@Query("delete from Holding h where h.brokerAccount.id = :brokerAccountId")
	void deleteAllByBrokerAccountId(@Param("brokerAccountId") UUID brokerAccountId);
}
