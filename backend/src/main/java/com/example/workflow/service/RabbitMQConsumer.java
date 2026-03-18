package com.example.workflow.service;

import com.example.workflow.config.RabbitMQConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
public class RabbitMQConsumer {

    @RabbitListener(queues = RabbitMQConfig.WORKFLOW_EXECUTION_QUEUE)
    public void consumeWorkflowEvent(Map<String, Object> event) {
        log.info(" [RabbitMQ] Received Workflow Event: {}", event);
        
        String executionId = String.valueOf(event.get("executionId"));
        String status = String.valueOf(event.get("status"));
        String stepName = String.valueOf(event.get("step"));
        String action = String.valueOf(event.get("action"));

        log.info(" >>> Processed Execution {}: Status={}, Step={}, Action={}", 
                executionId, status, stepName, action);
        
        // In a real system, this could trigger WebSocket notifications or emails
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void consumeAuthNotification(Map<String, Object> event) {
        log.info(" [RabbitMQ] Auth Notification Received: {}", event);
    }
}
