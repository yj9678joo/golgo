package com.app.golgo.portfolio.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record HoldingEditRequest(
	@NotEmpty
	List<@Valid HoldingPayload> holdings
) {
}
