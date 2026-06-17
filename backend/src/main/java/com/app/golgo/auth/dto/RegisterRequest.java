package com.app.golgo.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
	@NotBlank @Size(min = 4, max = 50) String loginId,
	@NotBlank String password,
	@NotBlank @Size(max = 50) String name,
	@NotBlank @Email String email,
	@NotBlank @Pattern(regexp = "^[가-힣A-Za-z0-9]{2,12}$") String nickname
) {
}
