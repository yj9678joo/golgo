package com.app.golgo.broker.dto;

import com.app.golgo.broker.entity.BrokerAccount;
import java.time.Instant;
import java.util.UUID;

public record BrokerAccountResponse(
	UUID accountId,
	String brokerCode,
	String connectionType,
	String accountNickname,
	Instant connectedAt,
	Instant lastSyncedAt,
	String notice
) {
	public static BrokerAccountResponse from(BrokerAccount account) {
		return new BrokerAccountResponse(
			account.getId(),
			account.getBrokerCode(),
			account.getConnectionType().name(),
			account.getAccountNickname(),
			account.getCreatedAt(),
			account.getLastSyncedAt(),
			"캡처 이미지를 업로드하면 보유 종목을 구성할 수 있습니다."
		);
	}
}
