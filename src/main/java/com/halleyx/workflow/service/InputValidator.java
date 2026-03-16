package com.halleyx.workflow.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Iterator;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class InputValidator {
    private final ObjectMapper objectMapper;

    /**
     * Validates input data against a simple schema.
     * Schema format example: {"fields": [{"name":"amount", "type":"number", "required":true, "allowedValues":[100, 200]}]}
     */
    public void validate(String inputData, String schemaJson) {
        if (schemaJson == null || schemaJson.trim().isEmpty()) {
            return;
        }

        try {
            JsonNode input = objectMapper.readTree(inputData);
            JsonNode schema = objectMapper.readTree(schemaJson);
            JsonNode fields = schema.get("fields");

            if (fields == null || !fields.isArray()) {
                return;
            }

            for (JsonNode field : fields) {
                String name = field.get("name").asText();
                String type = field.has("type") ? field.get("type").asText() : "string";
                boolean required = field.has("required") && field.get("required").asBoolean();

                JsonNode value = input.get(name);

                // Check required
                if (required && (value == null || value.isNull() || (value.isTextual() && value.asText().isEmpty()))) {
                    throw new IllegalArgumentException("Field '" + name + "' is required");
                }

                if (value != null && !value.isNull()) {
                    // Type validation
                    validateType(name, value, type);

                    // Allowed values validation
                    if (field.has("allowedValues") && field.get("allowedValues").isArray()) {
                        validateAllowedValues(name, value, field.get("allowedValues"));
                    }
                }
            }
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid JSON format in input or schema", e);
        }
    }

    private void validateType(String name, JsonNode value, String type) {
        switch (type.toLowerCase()) {
            case "number":
            case "integer":
                if (!value.isNumber()) {
                    throw new IllegalArgumentException("Field '" + name + "' must be a number");
                }
                break;
            case "boolean":
                if (!value.isBoolean()) {
                    throw new IllegalArgumentException("Field '" + name + "' must be a boolean");
                }
                break;
            case "string":
                if (!value.isTextual()) {
                    throw new IllegalArgumentException("Field '" + name + "' must be a string");
                }
                break;
            default:
                log.warn("Unknown type '{}' for field '{}', skipping type validation", type, name);
        }
    }

    private void validateAllowedValues(String name, JsonNode value, JsonNode allowedValues) {
        boolean found = false;
        String valText = value.asText();
        for (JsonNode allowed : allowedValues) {
            if (allowed.asText().equals(valText)) {
                found = true;
                break;
            }
        }
        if (!found) {
            throw new IllegalArgumentException("Field '" + name + "' has invalid value. Allowed: " + allowedValues.toString());
        }
    }
}
