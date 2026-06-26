package com.app.golgo.portfolio.storage;

import com.app.golgo.portfolio.service.ScreenshotException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class LocalScreenshotStorage implements ScreenshotStorage {

	private final Path storageRoot;

	public LocalScreenshotStorage(@Value("${golgo.screenshot.storage-dir:./data/screenshots}") String storageDir) {
		this.storageRoot = Path.of(storageDir).toAbsolutePath().normalize();
	}

	@Override
	public StoredScreenshot store(UUID userId, MultipartFile image) {
		String extension = extension(image.getContentType());
		Path userDir = storageRoot.resolve(userId.toString()).normalize();
		Path target = userDir.resolve(UUID.randomUUID() + extension).normalize();

		if (!target.startsWith(storageRoot)) {
			throw new ScreenshotException(HttpStatus.BAD_REQUEST, "SCREENSHOT_001", "지원하지 않는 저장 경로입니다.");
		}

		try {
			Files.createDirectories(userDir);
			image.transferTo(target);
		} catch (IOException exception) {
			throw new ScreenshotException(HttpStatus.INTERNAL_SERVER_ERROR, "SCREENSHOT_007", "이미지를 저장하지 못했습니다.");
		}

		return new StoredScreenshot(storageRoot.relativize(target).toString().replace('\\', '/'), target);
	}

	@Override
	public void delete(StoredScreenshot screenshot) {
		try {
			Files.deleteIfExists(screenshot.absolutePath());
		} catch (IOException exception) {
			throw new ScreenshotException(HttpStatus.INTERNAL_SERVER_ERROR, "SCREENSHOT_009", "이미지를 삭제하지 못했습니다.");
		}
	}

	private String extension(String contentType) {
		String normalized = contentType == null ? "" : contentType.toLowerCase(Locale.ROOT);
		if ("image/png".equals(normalized)) {
			return ".png";
		}
		if ("image/jpeg".equals(normalized)) {
			return ".jpg";
		}
		throw new ScreenshotException(HttpStatus.BAD_REQUEST, "SCREENSHOT_001", "지원하지 않는 이미지 형식입니다.");
	}
}
