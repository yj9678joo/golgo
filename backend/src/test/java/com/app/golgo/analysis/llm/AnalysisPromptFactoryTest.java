package com.app.golgo.analysis.llm;

import static org.assertj.core.api.Assertions.assertThat;

import com.app.golgo.analysis.entity.AnalysisType;
import com.app.golgo.analysis.entity.LlmProvider;
import org.junit.jupiter.api.Test;

class AnalysisPromptFactoryTest {

	private final AnalysisPromptFactory promptFactory = new AnalysisPromptFactory();

	@Test
	void systemPromptRequiresSevenStepStructuredJsonAnalysis() {
		String prompt = promptFactory.createSystemPrompt();

		assertThat(prompt).contains("valid JSON");
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
			AnalysisType.DEEP_INFERENCE,
			LlmProvider.GEMINI
		));

		assertThat(prompt).contains("NVDA");
		assertThat(prompt).contains("DEEP_INFERENCE");
		assertThat(prompt).doesNotContain("GEMINI_API_KEY");
	}
}
