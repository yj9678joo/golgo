package com.app.golgo.portfolio.parser;

import java.nio.file.Path;

public interface ScreenshotParser {

	ParsedPortfolio parse(Path imagePath);
}
