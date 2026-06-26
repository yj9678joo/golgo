package com.app.golgo.portfolio.dto;

import com.app.golgo.broker.entity.BrokerAccount;
import java.time.Instant;
import java.util.UUID;

public record PortfolioSyncStatusResponse(
	UUID accountId,
	String brokerCode,
	String connectionType,
	String syncStatus,
	Instant lastSyncedAt,
	Long daysSinceSync,
	String nudgeMessage
) {
	public static PortfolioSyncStatusResponse from(BrokerAccount account, String syncStatus, Long daysSinceSync) {
		return new PortfolioSyncStatusResponse(
			account.getId(),
			account.getBrokerCode(),
			account.getConnectionType().name(),
			syncStatus,
			account.getLastSyncedAt(),
			daysSinceSync,
			nudgeMessage(account, syncStatus, daysSinceSync)
		);
	}

	private static String nudgeMessage(BrokerAccount account, String syncStatus, Long daysSinceSync) {
		if (!"OUTDATED".equals(syncStatus)) {
			return null;
		}
		if (daysSinceSync == null) {
			return account.getAccountNickname() + " 포트폴리오를 최신화해 주세요.";
		}
		return account.getAccountNickname() + " 포트폴리오가 " + daysSinceSync + "일 전 기준입니다. 최신화해 주세요.";
	}
}
