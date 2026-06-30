package com.app.golgo.analysis.llm;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.app.golgo.analysis.entity.AnalysisType;
import com.app.golgo.analysis.entity.LlmProvider;
import com.app.golgo.analysis.entity.Recommendation;
import com.app.golgo.analysis.service.AnalysisException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class GeminiAnalysisClientTest {

	@Test
	void sendsStructuredAnalysisPromptAndParsesJsonResult() {
		RestClient.Builder builder = RestClient.builder().baseUrl("https://generativelanguage.googleapis.com");
		MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
		GeminiAnalysisClient client = new GeminiAnalysisClient(
			builder.defaultHeader("x-goog-api-key", "test-key").build(),
			new ObjectMapper(),
			new AnalysisPromptFactory(),
			new GeminiAnalysisProperties("test-key", "gemini-3.5-flash", "https://generativelanguage.googleapis.com", 45)
		);

		server.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"))
			.andExpect(header("x-goog-api-key", "test-key"))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("\"url_context\":{}")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("https://finviz.com/quote.ashx?t=NVDA")))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("responseSchema"))))
			.andRespond(withSuccess(geminiEvidenceResponse(), MediaType.APPLICATION_JSON));

		server.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"))
			.andExpect(header("x-goog-api-key", "test-key"))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("businessModel")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("revenueStreams")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("peg")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("responseSchema")))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("responseJsonSchema"))))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("additionalProperties"))))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("\"enum\":[\"BUY\",\"HOLD\",\"SELL\"]")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Market Cap: 3T")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("NVDA")))
			.andRespond(withSuccess(geminiResponse(), MediaType.APPLICATION_JSON));

		AnalysisStructuredResult result = client.analyze(new AnalysisPromptRequest(
			"NVDA",
			AnalysisType.DEEP_INFERENCE,
			LlmProvider.GEMINI
		));

		server.verify();
		assertThat(result.businessModel().summary()).isEqualTo("GPU 설계");
		assertThat(result.valuation().peg()).isEqualByComparingTo("1.60");
		assertThat(result.recommendation()).isEqualTo(Recommendation.HOLD);
	}

	@Test
	void throwsAnalysisExceptionWhenGeminiTextIsNotJson() {
		RestClient.Builder builder = RestClient.builder().baseUrl("https://generativelanguage.googleapis.com");
		MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
		GeminiAnalysisClient client = new GeminiAnalysisClient(
			builder.defaultHeader("x-goog-api-key", "test-key").build(),
			new ObjectMapper(),
			new AnalysisPromptFactory(),
			new GeminiAnalysisProperties("test-key", "gemini-3.5-flash", "https://generativelanguage.googleapis.com", 45)
		);
		server.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"))
			.andRespond(withSuccess(geminiEvidenceResponse(), MediaType.APPLICATION_JSON));

		server.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"))
			.andRespond(withSuccess("""
				{"candidates":[{"content":{"parts":[{"text":"not-json"}]}}]}
				""", MediaType.APPLICATION_JSON));

		assertThatThrownBy(() -> client.analyze(new AnalysisPromptRequest(
			"NVDA",
			AnalysisType.DEEP_INFERENCE,
			LlmProvider.GEMINI
		)))
			.isInstanceOf(AnalysisException.class)
			.extracting(error -> ((AnalysisException) error).code())
			.isEqualTo("LLM_002");
	}

	private String geminiEvidenceResponse() {
		return """
			{"candidates":[{"content":{"parts":[{"text":"Data source: finviz. Retrieval: success. Market Cap: 3T. P/E: 65.2."}]}}]}
			""";
	}

	private String geminiResponse() {
		return """
			{
			  "candidates": [{
			    "content": {"parts": [{"text": "{\\\"businessModel\\\":{\\\"summary\\\":\\\"GPU 설계\\\",\\\"revenueStreams\\\":[\\\"데이터센터\\\"],\\\"score\\\":9},\\\"industryStructure\\\":{\\\"moat\\\":\\\"STRONG\\\",\\\"cyclePosition\\\":\\\"EXPANSION\\\",\\\"competitors\\\":[\\\"AMD\\\"],\\\"score\\\":8},\\\"financials\\\":{\\\"roic\\\":45.2,\\\"fcfMarginPct\\\":38.5,\\\"earningsQuality\\\":\\\"HIGH\\\",\\\"score\\\":9},\\\"valuation\\\":{\\\"per\\\":65.2,\\\"peg\\\":1.60,\\\"pbr\\\":32.1,\\\"psr\\\":28.5,\\\"dcfFairValue\\\":850.00,\\\"judgment\\\":\\\"OVERVALUED\\\",\\\"score\\\":5},\\\"earningsCall\\\":{\\\"guidanceChange\\\":\\\"RAISED\\\",\\\"managementTone\\\":\\\"POSITIVE\\\",\\\"score\\\":8},\\\"macroPolicy\\\":{\\\"interestRateImpact\\\":\\\"NEGATIVE\\\",\\\"fxImpact\\\":\\\"NEUTRAL\\\",\\\"regulationRisk\\\":\\\"MEDIUM\\\",\\\"score\\\":6},\\\"catalystsAndRisks\\\":{\\\"catalysts\\\":[\\\"Blackwell\\\"],\\\"risks\\\":[\\\"중국 규제\\\"],\\\"selfRebuttal\\\":\\\"수요 둔화 시 조정\\\",\\\"score\\\":7},\\\"investmentThesis\\\":\\\"AI 인프라 독점력\\\",\\\"overallScore\\\":7.4,\\\"recommendation\\\":\\\"HOLD\\\"}"}]}
			  }]
			}
			""";
	}
}
