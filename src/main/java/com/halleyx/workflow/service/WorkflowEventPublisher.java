package com.halleyx.workflow.service;

import com.halleyx.workflow.dto.WorkflowEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkflowEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${workflow.queue.steps}")
    private String stepsQueue;

    @Value("${workflow.queue.notifications}")
    private String notificationsQueue;

    @Value("${workflow.queue.approvals}")
    private String approvalsQueue;

    @Value("${workflow.queue.status}")
    private String statusQueue;

    public void publishStepEvent(UUID executionId, UUID stepId, String eventType, String status) {
        WorkflowEvent event = WorkflowEvent.builder()
                .executionId(executionId)
                .stepId(stepId)
                .eventType(eventType)
                .status(status)
                .build();
        
        log.info("Publishing step event: {}", event);
        rabbitTemplate.convertAndSend("workflow.exchange", "workflow.step." + eventType.toLowerCase(), event);
    }

    public void publishStatusEvent(UUID executionId, String status, String data) {
        WorkflowEvent event = WorkflowEvent.builder()
                .executionId(executionId)
                .eventType("STATUS_UPDATE")
                .status(status)
                .data(data)
                .build();
        
        log.info("Publishing status event: {}", event);
        rabbitTemplate.convertAndSend("workflow.exchange", "workflow.status.update", event);
    }

    public void publishNotificationEvent(UUID executionId, UUID stepId, String channel, String template) {
        WorkflowEvent event = WorkflowEvent.builder()
                .executionId(executionId)
                .stepId(stepId)
                .eventType("NOTIFICATION")
                .data(String.format("{\"channel\":\"%s\", \"template\":\"%s\"}", channel, template))
                .build();
        
        log.info("Publishing notification event: {}", event);
        rabbitTemplate.convertAndSend("workflow.exchange", "workflow.notification." + channel.toLowerCase(), event);
    }
}
