package com.app.golgo.portfolio.parser.gemini;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

public class GoogleGeminiVisionClient implements GeminiVisionClient {

	private static final String PROMPT = """
		이 이미지는 미래에셋증권 M-STOCK의 MY자산 보유 종목 화면이다.
		각 행을 정확히 읽어 보유 종목을 JSON schema에 맞춰 반환하라.
		- 종목명, 보유수량, 평균단가, 현재가, 평가금액을 화면에 표시된 값 그대로 추출한다.
		- 쉼표와 통화 기호는 제거하고 손실 금액은 음수로 표현한다.
		- currentValueKrw는 화면의 평가금액이며 별도로 환율 계산하지 않는다.
		- 국내주식 탭은 currency=KRW, market=KRX로 반환한다.
		- 해외주식은 화면의 원 통화와 시장을 사용하고 평가금액은 원화 표시값을 사용한다.
		- ticker가 화면에 없으면 빈 문자열로 반환한다. 종목명이나 ticker를 추측하지 않는다.
		- 잘린 종목명은 보이는 문자열만 반환하고 warnings에 확인 필요 메시지를 추가한다.
		- 화면에 존재하지 않는 종목이나 숫자를 생성하지 않는다.
		""";

	private final RestClient restClient;
	private final ObjectMapper objectMapper;
	private final GeminiVisionProperties properties;

	public GoogleGeminiVisionClient(
		RestClient restClient,
		ObjectMapper objectMapper,
		GeminiVisionProperties properties
	) {
		this.restClient = restClient;
		this.objectMapper = objectMapper;
		this.properties = properties;
	}

	@Override
	public GeminiVisionResult parse(Path imagePath) {
		JsonNode response = restClient.post()
			.uri("/v1beta/models/{model}:generateContent", properties.model())
			.contentType(MediaType.APPLICATION_JSON)
			.body(requestBody(imagePath))
			.retrieve()
			.body(JsonNode.class);

		String json = response == null
			? ""
			: response.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
		if (json.isBlank()) {
			throw new IllegalStateException("Gemini 파싱 응답이 비어 있습니다.");
		}

		try {
			return objectMapper.readValue(json, GeminiVisionResult.class);
		} catch (IOException exception) {
			throw new IllegalStateException("Gemini 파싱 응답 형식이 올바르지 않습니다.", exception);
		}
	}

	private JsonNode requestBody(Path imagePath) {
		ObjectNode root = objectMapper.createObjectNode();
		ArrayNode parts = root.putArray("contents").addObject().put("role", "user").putArray("parts");
		parts.addObject().put("text", PROMPT);
		ObjectNode inlineData = parts.addObject().putObject("inlineData");
		inlineData.put("mimeType", mimeType(imagePath));
		inlineData.put("data", encode(imagePath));

		ObjectNode generationConfig = root.putObject("generationConfig");
		generationConfig.put("temperature", 0);
		generationConfig.put("responseMimeType", "application/json");
		generationConfig.set("responseJsonSchema", responseSchema());
		return root;
	}

	private JsonNode responseSchema() {
		ObjectNode holding = objectMapper.createObjectNode();
		holding.put("type", "object");
		ObjectNode holdingProperties = holding.putObject("properties");
		for (String field : new String[] {"ticker", "name", "market", "currency"}) {
			holdingProperties.putObject(field).put("type", "string");
		}
		for (String field : new String[] {"quantity", "avgPrice", "currentPrice", "currentValueKrw"}) {
			holdingProperties.putObject(field).put("type", "number");
		}
		holding.putArray("required").add("ticker").add("name").add("market").add("quantity")
			.add("avgPrice").add("currentPrice").add("currency").add("currentValueKrw");
		holding.put("additionalProperties", false);

		ObjectNode schema = objectMapper.createObjectNode();
		schema.put("type", "object");
		ObjectNode propertiesNode = schema.putObject("properties");
		propertiesNode.putObject("holdings").put("type", "array").set("items", holding);
		propertiesNode.putObject("confidence").put("type", "number");
		propertiesNode.putObject("warnings").put("type", "array").putObject("items").put("type", "string");
		schema.putArray("required").add("holdings").add("confidence").add("warnings");
		schema.put("additionalProperties", false);
		return schema;
	}

	private String encode(Path imagePath) {
		try {
			return Base64.getEncoder().encodeToString(Files.readAllBytes(imagePath));
		} catch (IOException exception) {
			throw new IllegalStateException("파싱할 이미지를 읽지 못했습니다.", exception);
		}
	}

	private String mimeType(Path imagePath) {
		String name = imagePath.getFileName().toString().toLowerCase();
		return name.endsWith(".png") ? "image/png" : "image/jpeg";
	}
}
