package com.app.golgo.portfolio.storage;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

class LocalScreenshotStorageTest {

	private static final UUID USER_ID = UUID.fromString("018f0000-0000-7000-8000-000000000001");

	@TempDir
	private Path tempDir;

	@Test
	void storeWritesFileUnderUserDirectory() {
		LocalScreenshotStorage storage = new LocalScreenshotStorage(tempDir.toString());
		MockMultipartFile file = new MockMultipartFile("image", "mts.png", "image/png", new byte[] {1, 2, 3});

		StoredScreenshot stored = storage.store(USER_ID, file);

		assertThat(stored.path()).contains(USER_ID.toString());
		assertThat(Files.exists(stored.absolutePath())).isTrue();
		assertThat(stored.absolutePath()).startsWith(tempDir.toAbsolutePath());
	}

	@Test
	void deleteRemovesStoredFile() {
		LocalScreenshotStorage storage = new LocalScreenshotStorage(tempDir.toString());
		MockMultipartFile file = new MockMultipartFile("image", "mts.png", "image/png", new byte[] {1, 2, 3});
		StoredScreenshot stored = storage.store(USER_ID, file);

		storage.delete(stored);

		assertThat(Files.exists(stored.absolutePath())).isFalse();
	}
}
