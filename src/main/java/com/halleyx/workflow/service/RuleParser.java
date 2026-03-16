package com.halleyx.workflow.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class RuleParser {
    private final ExpressionParser parser = new SpelExpressionParser();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean evaluate(String condition, String jsonData) {
        if ("DEFAULT".equalsIgnoreCase(condition)) {
            return true;
        }

        try {
            Map<String, Object> variables = objectMapper.readValue(jsonData, Map.class);
            StandardEvaluationContext context = new StandardEvaluationContext();
            context.setVariables(variables);

            String spelCondition = translateToSpel(condition, variables.keySet());

            Expression expression = parser.parseExpression(spelCondition);
            return Boolean.TRUE.equals(expression.getValue(context, Boolean.class));
        } catch (Exception e) {
            throw new RuntimeException("Validation error in rule: " + condition, e);
        }
    }

    private String translateToSpel(String condition, Iterable<String> fields) {
        String result = condition;

        // 1. Better logic function handling
        result = result.replaceAll("contains\\(([^,]+),\\s*(['\"])(.*?)\\2\\)", "#$1.contains('$3')");
        result = result.replaceAll("startsWith\\(([^,]+),\\s*(['\"])(.*?)\\2\\)", "#$1.startsWith('$3')");
        result = result.replaceAll("endsWith\\(([^,]+),\\s*(['\"])(.*?)\\2\\)", "#$1.endsWith('$3')");

        // 2. Production grade field detection: Handle nested logic and standard operators.
        // We use a regex that matches identifiers that are NOT part of a function or already prefixed.
        // This allows 'amount > 1000 && country == "US"'
        for (String field : fields) {
            // Match whole word, not preceded by # or ., not followed by ( (to avoid functions)
            result = result.replaceAll("(?<![#\\.\\w])\\b" + field + "\\b(?!\\()", "#" + field);
        }

        return result;
    }
}
