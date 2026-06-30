package com.app.golgo.analysis.llm;

import static org.assertj.core.api.Assertions.assertThat;

import com.app.golgo.analysis.entity.AnalysisType;
import com.app.golgo.analysis.entity.AssetType;
import com.app.golgo.analysis.entity.LlmProvider;
import org.junit.jupiter.api.Test;

class AnalysisPromptFactoryTest {

	private final AnalysisPromptFactory promptFactory = new AnalysisPromptFactory();

	@Test
	void systemPromptRequiresSevenStepStructuredJsonAnalysis() {
		String prompt = promptFactory.createSystemPrompt();

		assertThat(prompt).contains("valid JSON");
		assertThat(prompt).contains("URL Context");
		assertThat(prompt).contains("finance.naver.com");
		assertThat(prompt).contains("finviz.com");
		assertThat(prompt).contains("businessModel");
		assertThat(prompt).contains("industryStructure");
		assertThat(prompt).contains("financials");
		assertThat(prompt).contains("valuation");
		assertThat(prompt).contains("earningsCall");
		assertThat(prompt).contains("macroPolicy");
		assertThat(prompt).contains("catalystsAndRisks");
		assertThat(prompt).contains("PER");
		assertThat(prompt).contains("PEG");
		assertThat(prompt).contains("PBR");
		assertThat(prompt).contains("PSR");
		assertThat(prompt).contains("Do not guarantee profit");
	}

	@Test
	void userPromptContainsTickerAndAnalysisTypeWithoutSecrets() {
		String prompt = promptFactory.createUserPrompt(new AnalysisPromptRequest(
			"NVDA",
			AssetType.STOCK,
			AnalysisType.DEEP_INFERENCE,
			LlmProvider.GEMINI
		));

		assertThat(prompt).contains("NVDA");
		assertThat(prompt).contains("Declared asset type: STOCK");
		assertThat(prompt).contains("DEEP_INFERENCE");
		assertThat(prompt).contains("https://finviz.com/quote.ashx?t=NVDA");
		assertThat(prompt).doesNotContain("GEMINI_API_KEY");
	}

	@Test
	void userPromptUsesNaverFinanceUrlForDomesticStockCode() {
		String prompt = promptFactory.createUserPrompt(new AnalysisPromptRequest(
			"005930",
			AssetType.STOCK,
			AnalysisType.DEEP_INFERENCE,
			LlmProvider.GEMINI
		));

		assertThat(prompt).contains("https://finance.naver.com/item/main.naver?code=005930");
		assertThat(prompt).doesNotContain("finviz.com");
	}

	@Test
	void urlContextPromptCarriesDeclaredEtfTypeAndConflictCheck() {
		String prompt = promptFactory.createUrlContextPrompt(new AnalysisPromptRequest(
			"SPY",
			AssetType.ETF,
			AnalysisType.DEEP_INFERENCE,
			LlmProvider.GEMINI
		));

		assertThat(prompt).contains("Declared asset type: ETF");
		assertThat(prompt).contains("agrees or conflicts");
		assertThat(prompt).contains("https://finviz.com/quote.ashx?t=SPY");
	}
}
