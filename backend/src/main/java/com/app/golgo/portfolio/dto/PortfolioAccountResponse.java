package com.app.golgo.portfolio.dto;

import com.app.golgo.broker.entity.BrokerAccount;
import java.time.Instant;
import java.util.UUID;

public record PortfolioAccountResponse(
	UUID accountId,
	String brokerCode,
	String accountNickname,
	String connectionType,
	Instant lastSyncedAt,
	String syncStatus,
	Long daysSinceSync
) {
	public static PortfolioAccountResponse from(BrokerAccount account, String syncStatus, Long daysSinceSync) {
		return new PortfolioAccountResponse(
			account.getId(),
			account.getBrokerCode(),
			account.getAccountNickname(),
			account.getConnectionType().name(),
			account.getLastSyncedAt(),
			syncStatus,
			daysSinceSync
		);
	}
}
