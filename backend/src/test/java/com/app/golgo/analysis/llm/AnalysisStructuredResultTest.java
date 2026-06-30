package com.app.golgo.analysis.llm;

import static org.assertj.core.api.Assertions.assertThat;

import com.app.golgo.analysis.entity.Recommendation;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

class AnalysisStructuredResultTest {

	@Test
	void exposesSevenSectionsAndOverallJudgment() {
		AnalysisStructuredResult result = new AnalysisStructuredResult(
			new AnalysisStructuredResult.DataVerification(
				"ETF",
				"ETF",
				"finviz.com",
				"미확인",
				List.of("NAV"),
				List.of(),
				7
			),
			new AnalysisStructuredResult.BusinessModel("GPU 기반 AI 인프라", List.of("데이터센터"), 9),
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
			new AnalysisStructuredResult.CatalystsAndRisks(
				List.of("Blackwell 출시"),
				List.of("중국 수출 규제"),
				"AI 수요 둔화 시 조정 가능",
				7
			),
			new AnalysisStructuredResult.EtfAnalysis(
				"S&P 500",
				"SPDR",
				"미확인",
				null,
				null,
				null,
				new BigDecimal("0.09"),
				null,
				null,
				null,
				"미확인",
				List.of("미확인"),
				List.of("미국"),
				"해당 없음",
				"미확인",
				"미확인",
				7
			),
			"장기 AI 인프라 독점력 유효",
			new BigDecimal("7.4"),
			Recommendation.HOLD
		);

		assertThat(result.businessModel().score()).isEqualTo(9);
		assertThat(result.dataVerification().declaredAssetType()).isEqualTo("ETF");
		assertThat(result.etfAnalysis().expenseRatioPct()).isEqualByComparingTo("0.09");
		assertThat(result.valuation().peg()).isEqualByComparingTo("1.6");
		assertThat(result.catalystsAndRisks().risks()).contains("중국 수출 규제");
		assertThat(result.recommendation()).isEqualTo(Recommendation.HOLD);
	}
}
