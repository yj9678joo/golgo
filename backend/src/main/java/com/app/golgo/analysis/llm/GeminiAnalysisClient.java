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
			JsonNode response = restClient.post()
				.uri("/v1beta/models/{model}:generateContent", properties.model())
				.contentType(MediaType.APPLICATION_JSON)
				.body(requestBody(request))
				.retrieve()
				.body(JsonNode.class);
			return parseResponse(response);
		} catch (RestClientException exception) {
			throw AnalysisException.providerUnavailable("LLM API 응답 오류");
		}
	}

	private AnalysisStructuredResult parseResponse(JsonNode response) {
		String json = response == null
			? ""
			: response.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
		if (json.isBlank()) {
			throw AnalysisException.providerUnavailable("LLM 응답이 비어 있습니다.");
		}

		try {
			return objectMapper.readValue(json, AnalysisStructuredResult.class);
		} catch (IOException exception) {
			throw AnalysisException.parseFailed("LLM 응답 파싱 실패", exception);
		}
	}

	private JsonNode requestBody(AnalysisPromptRequest request) {
		ObjectNode root = objectMapper.createObjectNode();
		ArrayNode contents = root.putArray("contents");
		ArrayNode parts = contents.addObject().put("role", "user").putArray("parts");
		parts.addObject().put("text", promptFactory.createSystemPrompt());
		parts.addObject().put("text", promptFactory.createUserPrompt(request));

		ObjectNode generationConfig = root.putObject("generationConfig");
		generationConfig.put("temperature", 0);
		generationConfig.put("responseMimeType", "application/json");
		generationConfig.set("responseJsonSchema", responseSchema());
		return root;
	}

	private JsonNode responseSchema() {
		ObjectNode schema = objectMapper.createObjectNode();
		schema.put("type", "object");
		ObjectNode propertiesNode = schema.putObject("properties");
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
		propertiesNode.putObject("investmentThesis").put("type", "string");
		propertiesNode.putObject("overallScore").put("type", "number");
		propertiesNode.putObject("recommendation").put("type", "string");
		schema.putArray("required")
			.add("businessModel")
			.add("industryStructure")
			.add("financials")
			.add("valuation")
			.add("earningsCall")
			.add("macroPolicy")
			.add("catalystsAndRisks")
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
			propertiesNode.putObject(field).put("type", field.equals("score") ? "integer" : scalarType(field));
			required.add(field);
		}
		for (String field : arrayFields) {
			propertiesNode.putObject(field).put("type", "array").putObject("items").put("type", "string");
			required.add(field);
		}
		schema.put("additionalProperties", false);
		return schema;
	}

	private String scalarType(String field) {
		return switch (field) {
			case "roic", "fcfMarginPct", "per", "peg", "pbr", "psr", "dcfFairValue" -> "number";
			default -> "string";
		};
	}
}
