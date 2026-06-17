package com.app.golgo.portfolio.storage;

import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;

public interface ScreenshotStorage {

	StoredScreenshot store(UUID userId, MultipartFile image);
}
