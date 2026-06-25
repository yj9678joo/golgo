package com.app.golgo.portfolio.parser;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.YamlPropertiesFactoryBean;
import org.springframework.core.io.ClassPathResource;

class ScreenshotParserConfigurationTest {

	@Test
	void defaultsToGeminiParser() {
		YamlPropertiesFactoryBean yaml = new YamlPropertiesFactoryBean();
		yaml.setResources(new ClassPathResource("application.yml"));

		assertThat(yaml.getObject())
			.containsEntry("golgo.screenshot.parser", "${GOLGO_SCREENSHOT_PARSER:gemini}");
	}
}
