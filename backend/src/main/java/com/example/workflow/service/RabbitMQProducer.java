package com.example.workflow.service;

import com.example.workflow.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

//@Service
@RequiredArgsConstructor
@Slf4j
public class RabbitMQProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendUserRegisteredEvent(Map<String, Object> eventPayload) {
        log.info("Publishing USER_REGISTERED event for user: {}", eventPayload.get("username"));
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.REGISTRATION_ROUTING_KEY,
                eventPayload
        );
    }
    
    public void sendWorkflowExecutionEvent(Map<String, Object> eventPayload) {
        log.info("Publishing WORKFLOW_EXECUTION event for execution ID: {}", eventPayload.get("executionId"));
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.WORKFLOW_EXECUTION_ROUTING_KEY,
                eventPayload
        );
    }

    public void sendGenericWorkflowEvent(Map<String, Object> eventPayload) {
        String routingKey = "workflow.event." + eventPayload.getOrDefault("status", "update").toString().toLowerCase();
        log.info("Publishing Generic Workflow Event to: {}", routingKey);
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                routingKey,
                eventPayload
        );
    }
}
