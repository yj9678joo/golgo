package com.app.golgo.portfolio.repository;

import com.app.golgo.portfolio.entity.Holding;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HoldingRepository extends JpaRepository<Holding, UUID> {

	@Query("""
		select h from Holding h
		join fetch h.brokerAccount a
		where a.user.id = :userId
		  and a.deletedAt is null
		""")
	List<Holding> findAllActiveByUserId(@Param("userId") UUID userId);

	@Modifying
	@Query("delete from Holding h where h.brokerAccount.id = :brokerAccountId")
	void deleteAllByBrokerAccountId(@Param("brokerAccountId") UUID brokerAccountId);
}
