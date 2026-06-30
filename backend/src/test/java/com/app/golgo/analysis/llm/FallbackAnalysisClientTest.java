package com.app.golgo.analysis.llm;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.app.golgo.analysis.entity.AnalysisType;
import com.app.golgo.analysis.entity.LlmProvider;
import com.app.golgo.analysis.entity.Recommendation;
import com.app.golgo.analysis.service.AnalysisException;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

class FallbackAnalysisClientTest {

	@Test
	void fallsBackToNextClientForRetryableProviderErrors() {
		AnalysisLlmClient failing = request -> {
			throw AnalysisException.providerUnavailable("Gemini 응답 오류");
		};
		AnalysisStructuredResult expected = sampleResult();
		AnalysisLlmClient succeeding = request -> expected;
		FallbackAnalysisClient client = new FallbackAnalysisClient(List.of(failing, succeeding));

		AnalysisStructuredResult result = client.analyze(new AnalysisPromptRequest(
			"NVDA",
			AnalysisType.DEEP_INFERENCE,
			LlmProvider.GEMINI
		));

		assertThat(result).isSameAs(expected);
	}

	@Test
	void doesNotFallbackForSchemaParseErrors() {
		AnalysisLlmClient parseFailure = request -> {
			throw AnalysisException.parseFailed("LLM 응답 파싱 실패", new IllegalArgumentException("bad json"));
		};
		AnalysisLlmClient succeeding = request -> sampleResult();
		FallbackAnalysisClient client = new FallbackAnalysisClient(List.of(parseFailure, succeeding));

		assertThatThrownBy(() -> client.analyze(new AnalysisPromptRequest(
			"NVDA",
			AnalysisType.DEEP_INFERENCE,
			LlmProvider.GEMINI
		)))
			.isInstanceOf(AnalysisException.class)
			.extracting(error -> ((AnalysisException) error).code())
			.isEqualTo("LLM_002");
	}

	@Test
	void disabledFallbackClientsDoNotHidePrimaryProviderFailure() {
		AnalysisLlmClient failing = request -> {
			throw AnalysisException.providerUnavailable("Gemini URL Context timeout");
		};
		FallbackAnalysisClient client = new FallbackAnalysisClient(List.of(
			failing,
			new DisabledAnalysisClient("GPT"),
			new DisabledAnalysisClient("Claude")
		));

		assertThatThrownBy(() -> client.analyze(new AnalysisPromptRequest(
			"NVDA",
			AnalysisType.DEEP_INFERENCE,
			LlmProvider.GEMINI
		)))
			.isInstanceOf(AnalysisException.class)
			.hasMessage("Gemini URL Context timeout");
	}

	private AnalysisStructuredResult sampleResult() {
		return new AnalysisStructuredResult(
			new AnalysisStructuredResult.BusinessModel("GPU", List.of("데이터센터"), 9),
			new AnalysisStructuredResult.IndustryStructure("STRONG", "EXPANSION", List.of("AMD"), 8),
			new AnalysisStructuredResult.Financials(new BigDecimal("45.2"), new BigDecimal("38.5"), "HIGH", 9),
			new AnalysisStructuredResult.Valuation(
				new BigDecimal("65.2"),
				new BigDecimal("1.6"),
				new BigDecimal("32.1"),
				new BigDecimal("28.5"),
				new BigDecimal("850.00"),
				"OVERVALUED",
				5
			),
			new AnalysisStructuredResult.EarningsCall("RAISED", "POSITIVE", 8),
			new AnalysisStructuredResult.MacroPolicy("NEGATIVE", "NEUTRAL", "MEDIUM", 6),
			new AnalysisStructuredResult.CatalystsAndRisks(List.of("Blackwell"), List.of("규제"), "둔화 가능", 7),
			"AI 인프라",
			new BigDecimal("7.4"),
			Recommendation.HOLD
		);
	}
}
