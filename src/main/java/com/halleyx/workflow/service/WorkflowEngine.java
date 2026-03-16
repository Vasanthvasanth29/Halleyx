package com.halleyx.workflow.service;

import com.halleyx.workflow.model.*;
import com.halleyx.workflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Service;

import org.slf4j.MDC;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class WorkflowEngine {
    private final WorkflowRepository workflowRepository;
    private final StepRepository stepRepository;
    private final RuleRepository ruleRepository;
    private final ExecutionRepository executionRepository;
    private final ExecutionLogRepository logRepository;
    private final RuleParser ruleParser;
    private final WorkflowEventPublisher eventPublisher;
    private final InputValidator inputValidator;

    public Execution startExecution(UUID workflowId, String data, UUID userId, String username) {
        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        // 1. Validation for workflow execution
        inputValidator.validate(data, workflow.getInputSchema());

        Execution execution = Execution.builder()
                .workflowId(workflowId)
                .workflowVersion(workflow.getVersion())
                .status(Execution.Status.IN_PROGRESS) // Initial state
                .data(data)
                .currentStepId(workflow.getStartStepId())
                .triggeredBy(userId)
                .triggeredByUsername(username)
                .build();

        execution = executionRepository.save(execution);
        
        // As a senior engineer improvement: publish start event instead of direct trigger
        // For now, keeping trigger but it's part of the async decouple plan
        triggerStepExecution(execution.getId(), execution.getCurrentStepId(), "START");
        return execution;
    }

    public void triggerStepExecution(UUID executionId, UUID stepId, String triggerType) {
        eventPublisher.publishStepEvent(executionId, stepId, "STEP_TRIGGER", "PENDING");
    }

    public void processStep(Execution execution) {
        Workflow workflow = workflowRepository.findById(execution.getWorkflowId())
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        // 2. Loop protection
        if (execution.getIterationCount() >= workflow.getMaxIterations()) {
            execution.setStatus(Execution.Status.FAILED);
            execution.setEndedAt(LocalDateTime.now());
            executionRepository.save(execution);
            eventPublisher.publishStatusEvent(execution.getId(), "FAILED", "Workflow exceeded max iterations (Loop protection)");
            return;
        }

        // Increment iteration count
        execution.setIterationCount(execution.getIterationCount() + 1);

        if (execution.getCurrentStepId() == null) {
            execution.setStatus(Execution.Status.COMPLETED);
            execution.setEndedAt(LocalDateTime.now());
            executionRepository.save(execution);
            eventPublisher.publishStatusEvent(execution.getId(), "COMPLETED", execution.getData());
            return;
        }

        WorkflowStep step = stepRepository.findById(execution.getCurrentStepId())
                .orElseThrow(() -> new RuntimeException("Step not found"));

        ExecutionLog log = ExecutionLog.builder()
                .executionId(execution.getId())
                .stepName(step.getName())
                .stepType(step.getStepType().name())
                .status("IN_PROGRESS")
                .startedAt(LocalDateTime.now())
                .build();

        log = logRepository.save(log);

        // MDC for structured logging
        MDC.put("executionId", execution.getId().toString());
        MDC.put("stepId", step.getId().toString());
        MDC.put("stepName", step.getName());

        try {
            // If it's an approval step, we pause here
            if (step.getStepType() == WorkflowStep.StepType.APPROVAL) {
                execution.setStatus(Execution.Status.PENDING);
                executionRepository.save(execution);
                eventPublisher.publishStepEvent(execution.getId(), step.getId(), "APPROVAL_REQUIRED", "PENDING");
                return;
            }

            // For Notifications, we process asynchronously via RabbitMQ
            if (step.getStepType() == WorkflowStep.StepType.NOTIFICATION) {
                processNotificationAsync(execution, step, log);
                return;
            }

            // For Task we evaluate rules and move to next
            evaluateAndTransition(execution, step, log);
        } finally {
            MDC.clear();
        }
    }

    private void processNotificationAsync(Execution execution, WorkflowStep step, ExecutionLog log) {
        // Publish to specialized notification queue as per requirement 6
        String channel = (String) step.getMetadata().getOrDefault("channel", "EMAIL");
        String template = (String) step.getMetadata().getOrDefault("message_template", "Notification for step: " + step.getName());
        
        eventPublisher.publishNotificationEvent(execution.getId(), step.getId(), channel, template);
        
        log.setNote("Notification sent via " + channel);
        log.setStatus("COMPLETED");
        log.setEndedAt(LocalDateTime.now());
        logRepository.save(log);

        // For notification steps, we assume transition to next if no rules or just follow rules
        evaluateAndTransition(execution, step, log);
    }

    public void approveStep(UUID executionId, UUID userId) {
        Execution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("Execution not found"));

        WorkflowStep step = stepRepository.findById(execution.getCurrentStepId())
                .orElseThrow(() -> new RuntimeException("Step not found"));

        ExecutionLog log = logRepository.findByExecutionIdOrderByStartedAtAsc(executionId)
                .stream()
                .filter(l -> l.getStepName().equals(step.getName()) && "IN_PROGRESS".equals(l.getStatus()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Log not found"));

        log.setApproverId(userId.toString());
        log.setStatus("COMPLETED");
        log.setEndedAt(LocalDateTime.now());
        logRepository.save(log);

        evaluateAndTransition(execution, step, log);
    }

    private void evaluateAndTransition(Execution execution, WorkflowStep step, ExecutionLog log) {
        List<Rule> rules = ruleRepository.findByStepIdOrderByPriorityAsc(step.getId());
        Rule matchedRule = null;
        StringBuilder evaluationLogs = new StringBuilder("[");

        for (Rule rule : rules) {
            try {
                boolean result = ruleParser.evaluate(rule.getCondition(), execution.getData());
                evaluationLogs.append(String.format("{\"rule\":\"%s\", \"result\":%b},", 
                    rule.getCondition().replace("\"", "\\\""), result));
                if (result && matchedRule == null) {
                    matchedRule = rule;
                }
            } catch (Exception e) {
                // Log error and skip invalid rule as per requirement
                evaluationLogs.append(String.format("{\"rule\":\"%s\", \"error\":\"%s\"},", 
                    rule.getCondition().replace("\"", "\\\""), e.getMessage().replace("\"", "\\\"")));
            }
        }
        if (evaluationLogs.length() > 1) evaluationLogs.setLength(evaluationLogs.length() - 1);
        evaluationLogs.append("]");

        log.setEvaluatedRules(evaluationLogs.toString());
        log.setStatus("COMPLETED");
        log.setEndedAt(LocalDateTime.now());
        
        // Calculate duration
        java.time.Duration duration = java.time.Duration.between(log.getStartedAt(), log.getEndedAt());
        log.setExecutionDuration(duration.toSeconds() + " seconds");

        if (matchedRule != null) {
            log.setSelectedNextStep(matchedRule.getNextStepId() != null ? matchedRule.getNextStepId().toString() : "END");
            execution.setCurrentStepId(matchedRule.getNextStepId());
            logRepository.save(log);
            executionRepository.save(execution);
            triggerStepExecution(execution.getId(), execution.getCurrentStepId(), "NEXT");
        } else {
            // Check for a DEFAULT rule fallback explicitly if not matched above 
            // (though normally DEFAULT should be in the rules list with lowest priority)
            log.setStatus("FAILED");
            log.setErrorMessage("No matching rule found.");
            logRepository.save(log);
            execution.setStatus(Execution.Status.FAILED);
            execution.setEndedAt(LocalDateTime.now());
            executionRepository.save(execution);
            eventPublisher.publishStatusEvent(execution.getId(), "FAILED", "No matching rule");
        }
    }

    public void cancelExecution(UUID executionId) {
        Execution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("Execution not found"));
        
        execution.setStatus(Execution.Status.CANCELED);
        execution.setEndedAt(LocalDateTime.now());
        executionRepository.save(execution);
        eventPublisher.publishStatusEvent(executionId, "CANCELED", "Execution cancelled by user");
    }

    public void retryExecution(UUID executionId) {
        Execution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("Execution not found"));
        
        WorkflowStep step = stepRepository.findById(execution.getCurrentStepId())
                .orElseThrow(() -> new RuntimeException("Step not found"));

        // 6. Step Retry Mechanism
        if (execution.getRetries() >= step.getMaxRetries()) {
            throw new RuntimeException("Max retries reached for step: " + step.getName());
        }

        execution.setStatus(Execution.Status.IN_PROGRESS);
        execution.setRetries(execution.getRetries() + 1);
        executionRepository.save(execution);
        
        triggerStepExecution(executionId, execution.getCurrentStepId(), "RETRY");
    }
}
