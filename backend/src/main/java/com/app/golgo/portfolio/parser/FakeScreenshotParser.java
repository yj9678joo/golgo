package com.app.golgo.portfolio.parser;

import java.nio.file.Path;
import org.springframework.stereotype.Component;

@Component
public class FakeScreenshotParser implements ScreenshotParser {

	@Override
	public ParsedPortfolio parse(Path imagePath) {
		return ParsedPortfolio.sample();
	}
}
