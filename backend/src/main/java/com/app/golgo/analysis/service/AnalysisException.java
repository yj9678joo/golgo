package com.app.golgo.analysis.service;

import org.springframework.http.HttpStatus;

public class AnalysisException extends RuntimeException {

	private final HttpStatus status;
	private final String code;
	private final boolean retryable;

	private AnalysisException(HttpStatus status, String code, String message, Throwable cause, boolean retryable) {
		super(message, cause);
		this.status = status;
		this.code = code;
		this.retryable = retryable;
	}

	public static AnalysisException providerUnavailable(String message) {
		return new AnalysisException(HttpStatus.SERVICE_UNAVAILABLE, "LLM_001", message, null, true);
	}

	public static AnalysisException parseFailed(String message, Throwable cause) {
		return new AnalysisException(HttpStatus.INTERNAL_SERVER_ERROR, "LLM_002", message, cause, false);
	}

	public static AnalysisException rateLimited(String message) {
		return new AnalysisException(HttpStatus.TOO_MANY_REQUESTS, "LLM_003", message, null, true);
	}

	public static AnalysisException notFound() {
		return new AnalysisException(HttpStatus.NOT_FOUND, "ANALYSIS_001", "분석 리포트를 찾을 수 없습니다.", null, false);
	}

	public HttpStatus status() {
		return status;
	}

	public String code() {
		return code;
	}

	public boolean retryable() {
		return retryable;
	}
}
