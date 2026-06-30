package com.app.golgo.analysis.llm;

import com.app.golgo.analysis.service.AnalysisException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

public class GeminiAnalysisClient implements AnalysisLlmClient {

	private final RestClient restClient;
	private final ObjectMapper objectMapper;
	private final AnalysisPromptFactory promptFactory;
	private final GeminiAnalysisProperties properties;

	public GeminiAnalysisClient(
		RestClient restClient,
		ObjectMapper objectMapper,
		AnalysisPromptFactory promptFactory,
		GeminiAnalysisProperties properties
	) {
		this.restClient = restClient;
		this.objectMapper = objectMapper;
		this.promptFactory = promptFactory;
		this.properties = properties;
	}

	@Override
	public AnalysisStructuredResult analyze(AnalysisPromptRequest request) {
		try {
			String sourceEvidence = fetchSourceEvidence(request);
			JsonNode response = restClient.post()
				.uri("/v1beta/models/{model}:generateContent", properties.model())
				.contentType(MediaType.APPLICATION_JSON)
				.body(requestBody(request, sourceEvidence))
				.retrieve()
				.body(JsonNode.class);
			return parseResponse(response);
		} catch (RestClientException exception) {
			throw AnalysisException.providerUnavailable(errorMessage(exception));
		}
	}

	private String errorMessage(RestClientException exception) {
		if (exception instanceof RestClientResponseException responseException) {
			String responseBody = responseException.getResponseBodyAsString();
			if (!responseBody.isBlank()) {
				return "LLM API 응답 오류: " + responseBody;
			}
		}
		return "LLM API 응답 오류";
	}

	private String fetchSourceEvidence(AnalysisPromptRequest request) {
		JsonNode response = restClient.post()
			.uri("/v1beta/models/{model}:generateContent", properties.model())
			.contentType(MediaType.APPLICATION_JSON)
			.body(urlContextRequestBody(request))
			.retrieve()
			.body(JsonNode.class);
		String evidence = responseText(response);
		if (evidence.isBlank()) {
			throw AnalysisException.providerUnavailable("URL Context 응답이 비어 있습니다.");
		}
		return evidence;
	}

	private AnalysisStructuredResult parseResponse(JsonNode response) {
		String json = responseText(response);
		if (json.isBlank()) {
			throw AnalysisException.providerUnavailable("LLM 응답이 비어 있습니다.");
		}

		try {
			return objectMapper.readValue(json, AnalysisStructuredResult.class);
		} catch (IOException exception) {
			throw AnalysisException.parseFailed("LLM 응답 파싱 실패", exception);
		}
	}

	private String responseText(JsonNode response) {
		JsonNode parts = response == null
			? objectMapper.createArrayNode()
			: response.path("candidates").path(0).path("content").path("parts");
		if (!parts.isArray()) {
			return "";
		}

		StringBuilder text = new StringBuilder();
		for (JsonNode part : parts) {
			text.append(part.path("text").asText());
		}
		return text.toString();
	}

	private JsonNode urlContextRequestBody(AnalysisPromptRequest request) {
		ObjectNode root = objectMapper.createObjectNode();
		ArrayNode contents = root.putArray("contents");
		ArrayNode parts = contents.addObject().put("role", "user").putArray("parts");
		parts.addObject().put("text", promptFactory.createUrlContextPrompt(request));
		root.putArray("tools").addObject().putObject("url_context");

		ObjectNode generationConfig = root.putObject("generationConfig");
		generationConfig.put("temperature", 0);
		return root;
	}

	private JsonNode requestBody(AnalysisPromptRequest request, String sourceEvidence) {
		ObjectNode root = objectMapper.createObjectNode();
		ArrayNode contents = root.putArray("contents");
		ArrayNode parts = contents.addObject().put("role", "user").putArray("parts");
		parts.addObject().put("text", promptFactory.createSystemPrompt());
		parts.addObject().put("text", promptFactory.createUserPrompt(request));
		parts.addObject().put("text", "URL Context source evidence:\n" + sourceEvidence);

		ObjectNode generationConfig = root.putObject("generationConfig");
		generationConfig.put("temperature", 0);
		generationConfig.put("responseMimeType", "application/json");
		generationConfig.set("responseSchema", responseSchema());
		return root;
	}

	private JsonNode responseSchema() {
		ObjectNode schema = objectMapper.createObjectNode();
		schema.put("type", "object");
		ObjectNode propertiesNode = schema.putObject("properties");
		propertiesNode.set(
			"dataVerification",
			objectSchema(
				new String[] {"declaredAssetType", "verifiedAssetType", "dataSource", "dataAsOf", "score"},
				new String[] {"unavailableFields", "warnings"}
			)
		);
		propertiesNode.set("businessModel", objectSchema(new String[] {"summary", "score"}, new String[] {"revenueStreams"}));
		propertiesNode.set(
			"industryStructure",
			objectSchema(new String[] {"moat", "cyclePosition", "score"}, new String[] {"competitors"})
		);
		propertiesNode.set("financials", objectSchema(new String[] {"roic", "fcfMarginPct", "earningsQuality", "score"}, new String[] {}));
		propertiesNode.set(
			"valuation",
			objectSchema(new String[] {"per", "peg", "pbr", "psr", "dcfFairValue", "judgment", "score"}, new String[] {})
		);
		propertiesNode.set("earningsCall", objectSchema(new String[] {"guidanceChange", "managementTone", "score"}, new String[] {}));
		propertiesNode.set(
			"macroPolicy",
			objectSchema(new String[] {"interestRateImpact", "fxImpact", "regulationRisk", "score"}, new String[] {})
		);
		propertiesNode.set(
			"catalystsAndRisks",
			objectSchema(new String[] {"selfRebuttal", "score"}, new String[] {"catalysts", "risks"})
		);
		ObjectNode etfAnalysisSchema = (ObjectNode) objectSchema(
			new String[] {
				"indexName",
				"issuer",
				"replicationMethod",
				"nav",
				"marketPrice",
				"premiumDiscountPct",
				"expenseRatioPct",
				"aum",
				"trackingErrorPct",
				"averageDailyTradingValue",
				"bidAskSpread",
				"leverageInverseSynthetic",
				"currencyHedge",
				"liquidityRisk",
				"score"
			},
			new String[] {"topHoldings", "exposures"}
		);
		etfAnalysisSchema.put("nullable", true);
		propertiesNode.set("etfAnalysis", etfAnalysisSchema);
		propertiesNode.putObject("investmentThesis").put("type", "string");
		propertiesNode.putObject("overallScore")
			.put("type", "number")
			.put("minimum", 0)
			.put("maximum", 10);
		propertiesNode.putObject("recommendation")
			.put("type", "string")
			.putArray("enum")
			.add("BUY")
			.add("HOLD")
			.add("SELL");
		schema.putArray("required")
			.add("dataVerification")
			.add("businessModel")
			.add("industryStructure")
			.add("financials")
			.add("valuation")
			.add("earningsCall")
			.add("macroPolicy")
			.add("catalystsAndRisks")
			.add("etfAnalysis")
			.add("investmentThesis")
			.add("overallScore")
			.add("recommendation");
		return schema;
	}

	private JsonNode objectSchema(String[] scalarFields, String[] arrayFields) {
		ObjectNode schema = objectMapper.createObjectNode();
		schema.put("type", "object");
		ObjectNode propertiesNode = schema.putObject("properties");
		ArrayNode required = schema.putArray("required");
		for (String field : scalarFields) {
			ObjectNode property = propertiesNode.putObject(field).put("type", field.equals("score") ? "integer" : scalarType(field));
			if (field.equals("score")) {
				property.put("minimum", 0).put("maximum", 10);
			} else {
				property.put("nullable", true);
			}
			required.add(field);
		}
		for (String field : arrayFields) {
			propertiesNode.putObject(field)
				.put("type", "array")
				.put("nullable", true)
				.putObject("items")
				.put("type", "string");
			required.add(field);
		}
		return schema;
	}

	private String scalarType(String field) {
		return switch (field) {
			case "roic",
				"fcfMarginPct",
				"per",
				"peg",
				"pbr",
				"psr",
				"dcfFairValue",
				"nav",
				"marketPrice",
				"premiumDiscountPct",
				"expenseRatioPct",
				"aum",
				"trackingErrorPct",
				"averageDailyTradingValue" -> "number";
			default -> "string";
		};
	}
}
