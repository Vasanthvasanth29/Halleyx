package com.example.workflow.service;

import com.example.workflow.config.RabbitMQConfig;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RabbitMQProducerTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private RabbitMQProducer rabbitMQProducer;

    @Test
    void testSendUserRegisteredEvent() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("username", "testuser");
        payload.put("email", "test@example.com");

        rabbitMQProducer.sendUserRegisteredEvent(payload);

        verify(rabbitTemplate).convertAndSend(
                eq(RabbitMQConfig.EXCHANGE_NAME),
                eq(RabbitMQConfig.REGISTRATION_ROUTING_KEY),
                eq(payload)
        );
    }

    @Test
    void testSendWorkflowExecutionEvent() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("executionId", "12345");
        payload.put("status", "STARTED");

        rabbitMQProducer.sendWorkflowExecutionEvent(payload);

        verify(rabbitTemplate).convertAndSend(
                eq(RabbitMQConfig.EXCHANGE_NAME),
                eq(RabbitMQConfig.WORKFLOW_EXECUTION_ROUTING_KEY),
                eq(payload)
        );
    }

    @Test
    void testSendGenericWorkflowEvent() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("status", "APPROVED");
        payload.put("executionId", "ABC-123");

        rabbitMQProducer.sendGenericWorkflowEvent(payload);

        String expectedRoutingKey = "workflow.event.approved";
        verify(rabbitTemplate).convertAndSend(
                eq(RabbitMQConfig.EXCHANGE_NAME),
                eq(expectedRoutingKey),
                eq(payload)
        );
    }
}
