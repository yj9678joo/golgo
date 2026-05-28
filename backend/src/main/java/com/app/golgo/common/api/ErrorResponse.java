package com.app.golgo.common.api;

import java.time.Instant;

public record ErrorResponse(boolean success, ErrorBody error, Instant timestamp) {

	public static ErrorResponse of(String code, String message, String detail) {
		return new ErrorResponse(false, new ErrorBody(code, message, detail), Instant.now());
	}

	public record ErrorBody(String code, String message, String detail) {
	}
}
