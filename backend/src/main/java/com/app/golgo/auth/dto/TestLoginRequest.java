package com.app.golgo.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record TestLoginRequest(
	@NotBlank String loginId,
	@NotBlank String password
) {
}
