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

            // Translate DSL to Spel
            // contains(field, 'value') -> #field.contains('value')
            // field == 'value' -> #field == 'value'
            String spelCondition = translateToSpel(condition, variables.keySet());

            Expression expression = parser.parseExpression(spelCondition);
            return Boolean.TRUE.equals(expression.getValue(context, Boolean.class));
        } catch (Exception e) {
            return false;
        }
    }

    private String translateToSpel(String condition, Iterable<String> fields) {
        String result = condition;

        // Replace logic functions: contains(field, 'value') -> #field.contains('value')
        // Using [^,]+ to match field names more flexibly
        result = result.replaceAll("contains\\(([^,]+),\\s*(['\"])(.*?)\\2\\)", "#$1.contains('$3')");
        result = result.replaceAll("startsWith\\(([^,]+),\\s*(['\"])(.*?)\\2\\)", "#$1.startsWith('$3')");
        result = result.replaceAll("endsWith\\(([^,]+),\\s*(['\"])(.*?)\\2\\)", "#$1.endsWith('$3')");

        // Prefix all fields with # for SpEL variables, but avoid prefixing already prefixed ones
        for (String field : fields) {
            // Avoid double prefixing and only match whole words
            result = result.replaceAll("(?<![#\\w])\\b" + field + "\\b", "#" + field);
        }

        return result;
    }
}
