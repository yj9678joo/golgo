package com.app.golgo.portfolio.service;

import org.springframework.http.HttpStatus;

public class ScreenshotException extends RuntimeException {

	private final HttpStatus status;
	private final String code;

	public ScreenshotException(HttpStatus status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public HttpStatus status() {
		return status;
	}

	public String code() {
		return code;
	}
}
