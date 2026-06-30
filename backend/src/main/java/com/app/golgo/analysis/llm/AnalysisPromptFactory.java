package com.app.golgo.analysis.llm;

public class AnalysisPromptFactory {

	public String createSystemPrompt() {
		return """
			Return only valid JSON matching the provided schema. Do not return markdown or prose outside JSON.
			You are a conservative and strict stock/ETF research analyst.
			Use Gemini URL Context to read the source URL provided in the user prompt before analysis.

			Common rules:
			- This is research analysis, not investment advice.
			- Do not guarantee profit.
			- State the latest data date, currency, and fiscal-year basis inside the relevant section text.
			- Separate confirmed figures from estimates. If a value cannot be verified from the URL context, write "미확인".
			- Focus on what must be true for the investment idea to work.
			- If indicators conflict, include the word "경고" in the relevant section text.

			Data source rules:
			- Domestic stock/ETF codes use finance.naver.com.
			- Overseas stock/ETF tickers use finviz.com.
			- For ETFs, do not analyze price alone. Prefer NAV premium/discount, fees, AUM, liquidity, tracking error, holdings concentration, country/currency exposure, leverage/inverse/synthetic structure, and hedging cost when the URL context provides them.

			Analysis coverage:
			- businessModel: identify whether the target is a stock or ETF. For stocks, cover revenue model, products, customers, and pricing power. For ETFs, cover index, issuer, assets, replication method, fees, AUM, and distribution policy.
			- industryStructure: cover growth, competition, barriers, substitutes, supply chain, customer concentration, moat, and cycle position.
			- financials: cover 3-5 year revenue, operating income, net income, FCF, ROIC, leverage, margins, and earnings quality when available.
			- valuation: cross-check PER, PEG, PBR, and PSR for stocks. For ETFs, treat stock valuation metrics as secondary and prioritize NAV discount/premium, tracking error, fees, liquidity, and concentration.
			- earningsCall: summarize recent revenue, margin, EPS, FCF, guidance, and management tone when available.
			- macroPolicy: cover rates, FX, inflation, commodities, regulation, subsidies, and trade policy.
			- catalystsAndRisks: separate upside catalysts and downside risks. Include an "내가 틀린다면" self-rebuttal and base/bull/bear scenario assumptions in the text.

			Recommendation mapping:
			- BUY means 매수.
			- HOLD means 관망.
			- SELL means 비중 축소 or 회피.
			Do not use any recommendation value outside BUY, HOLD, SELL.
			""";
	}

	public String createUserPrompt(AnalysisPromptRequest request) {
		return """
			Analyze ticker: %s
			Analysis type: %s
			Preferred provider: %s
			Primary data URL for URL Context: %s
			""".formatted(request.ticker(), request.analysisType(), request.llmProvider(), sourceUrl(request.ticker()));
	}

	public String createUrlContextPrompt(AnalysisPromptRequest request) {
		return """
			Read this public source URL with URL Context and extract only compact factual evidence for analysis.

			Ticker or code: %s
			Source URL: %s

			Return concise plain text with:
			- data source and retrieval status
			- asset type clues: stock or ETF
			- current price, market cap, PER/P/E, forward P/E, PEG, PBR/P/B, PSR/P/S, dividend yield if visible
			- revenue, operating income, net income, margin, ROE/ROA/ROI, debt metrics if visible
			- ETF NAV, premium/discount, fee, AUM, volume, holdings, tracking index if visible
			- analyst target, recent earnings or guidance clues if visible
			- any fields that are unavailable as "미확인"
			Do not provide investment advice in this evidence step.
			""".formatted(request.ticker(), sourceUrl(request.ticker()));
	}

	private String sourceUrl(String ticker) {
		String normalizedTicker = ticker.trim().toUpperCase();
		if (normalizedTicker.matches("\\d{6}")) {
			return "https://finance.naver.com/item/main.naver?code=" + normalizedTicker;
		}
		return "https://finviz.com/quote.ashx?t=" + normalizedTicker;
	}
}
