package com.app.golgo.common.api;

import com.app.golgo.auth.service.AuthException;
import com.app.golgo.portfolio.service.ScreenshotException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(AuthException.class)
	public ResponseEntity<ErrorResponse> handleAuthException(AuthException exception) {
		return ResponseEntity.status(exception.status())
			.body(ErrorResponse.of(exception.code(), exception.getMessage(), null));
	}

	@ExceptionHandler(ScreenshotException.class)
	public ResponseEntity<ErrorResponse> handleScreenshotException(ScreenshotException exception) {
		return ResponseEntity.status(exception.status())
			.body(ErrorResponse.of(exception.code(), exception.getMessage(), null));
	}

	@ExceptionHandler({MethodArgumentNotValidException.class, BindException.class})
	public ResponseEntity<ErrorResponse> handleValidationException(Exception exception) {
		return ResponseEntity.badRequest()
			.body(ErrorResponse.of("AUTH_007", "요청 값 형식이 올바르지 않습니다.", exception.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException exception) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(ErrorResponse.of("COMMON_001", exception.getMessage(), null));
	}
}
