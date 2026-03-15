package com.halleyx.workflow.service;

import com.halleyx.workflow.dto.WorkflowEvent;
import com.halleyx.workflow.model.Execution;
import com.halleyx.workflow.repository.ExecutionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkflowEventConsumer {

    private final WorkflowEngine workflowEngine;
    private final ExecutionRepository executionRepository;

    @RabbitListener(queues = "${workflow.queue.steps}")
    public void handleStepEvent(WorkflowEvent event) {
        log.info("Received step event: {}", event);
        
        Execution execution = executionRepository.findById(event.getExecutionId())
                .orElseThrow(() -> new RuntimeException("Execution not found: " + event.getExecutionId()));

        if ("STEP_TRIGGER".equals(event.getEventType())) {
            workflowEngine.processStep(execution);
        }
    }

    @RabbitListener(queues = "${workflow.queue.status}")
    public void handleStatusEvent(WorkflowEvent event) {
        log.info("Received status event: {}", event);
        // Additional async status processing like updating sockets, etc. can go here
    }
}
