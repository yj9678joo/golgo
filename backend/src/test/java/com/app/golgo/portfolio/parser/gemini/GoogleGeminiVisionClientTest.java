package com.app.golgo.portfolio.parser.gemini;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class GoogleGeminiVisionClientTest {

	@TempDir
	Path tempDir;

	@Test
	void sendsMstockImageWithStructuredOutputAndParsesResponse() throws Exception {
		RestClient.Builder builder = RestClient.builder().baseUrl("https://generativelanguage.googleapis.com");
		MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
		GoogleGeminiVisionClient client = new GoogleGeminiVisionClient(
			builder.defaultHeader("x-goog-api-key", "test-key").build(),
			new ObjectMapper(),
			new GeminiVisionProperties("test-key", "gemini-3.5-flash", "https://generativelanguage.googleapis.com")
		);
		Path image = tempDir.resolve("mstock.png");
		Files.write(image, new byte[] {1, 2, 3});

		server.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"))
			.andExpect(header("x-goog-api-key", "test-key"))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("M-STOCK")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("responseJsonSchema")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("image/png")))
			.andRespond(withSuccess(geminiResponse(), MediaType.APPLICATION_JSON));

		GeminiVisionResult result = client.parse(image);

		server.verify();
		assertThat(result.holdings()).singleElement().satisfies(holding -> {
			assertThat(holding.name()).isEqualTo("TIGER 미국S&P500");
			assertThat(holding.currentValueKrw()).isEqualByComparingTo("6313130");
		});
	}

	private String geminiResponse() {
		return """
			{
			  "candidates": [{
			    "content": {"parts": [{"text": "{\\\"holdings\\\":[{\\\"ticker\\\":\\\"\\\",\\\"name\\\":\\\"TIGER 미국S&P500\\\",\\\"market\\\":\\\"KOSPI\\\",\\\"quantity\\\":223,\\\"avgPrice\\\":23063,\\\"currentPrice\\\":28310,\\\"currency\\\":\\\"KRW\\\",\\\"currentValueKrw\\\":6313130}],\\\"confidence\\\":0.96,\\\"warnings\\\":[]}"}]}
			  }]
			}
			""";
	}
}
