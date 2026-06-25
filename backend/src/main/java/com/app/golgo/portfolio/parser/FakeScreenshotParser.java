package com.app.golgo.portfolio.parser;

import java.nio.file.Path;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "golgo.screenshot", name = "parser", havingValue = "fake", matchIfMissing = true)
public class FakeScreenshotParser implements ScreenshotParser {

	@Override
	public ParsedPortfolio parse(Path imagePath) {
		return ParsedPortfolio.sample();
	}
}
