package com.app.golgo.portfolio.parser.gemini;

import java.nio.file.Path;

public interface GeminiVisionClient {

	GeminiVisionResult parse(Path imagePath);
}
