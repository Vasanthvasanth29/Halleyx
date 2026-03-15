package com.halleyx.workflow.service;

import com.halleyx.workflow.model.*;
import com.halleyx.workflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

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

    public Execution startExecution(UUID workflowId, String data, UUID userId, String username) {
        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        Execution execution = Execution.builder()
                .workflowId(workflowId)
                .workflowVersion(workflow.getVersion())
                .status(Execution.Status.IN_PROGRESS)
                .data(data)
                .currentStepId(workflow.getStartStepId())
                .triggeredBy(userId)
                .triggeredByUsername(username)
                .build();

        execution = executionRepository.save(execution);
        triggerStepExecution(execution.getId(), execution.getCurrentStepId(), "START");
        return execution;
    }

    public void triggerStepExecution(UUID executionId, UUID stepId, String triggerType) {
        eventPublisher.publishStepEvent(executionId, stepId, "STEP_TRIGGER", "PENDING");
    }

    public void processStep(Execution execution) {
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

        // If it's an approval step, we pause here
        if (step.getStepType() == WorkflowStep.StepType.APPROVAL) {
            execution.setStatus(Execution.Status.PENDING);
            executionRepository.save(execution);
            eventPublisher.publishStepEvent(execution.getId(), step.getId(), "APPROVAL_REQUIRED", "PENDING");
            return;
        }

        // For Task and Notification, we evaluate rules and move to next
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
            boolean result = ruleParser.evaluate(rule.getCondition(), execution.getData());
            evaluationLogs.append(String.format("{\"rule\":\"%s\", \"result\":%b},", 
                rule.getCondition().replace("\"", "\\\""), result));
            if (result && matchedRule == null) {
                matchedRule = rule;
            }
        }
        if (evaluationLogs.length() > 1) evaluationLogs.setLength(evaluationLogs.length() - 1);
        evaluationLogs.append("]");

        log.setEvaluatedRules(evaluationLogs.toString());
        log.setStatus("COMPLETED");
        log.setEndedAt(LocalDateTime.now());

        if (matchedRule != null) {
            log.setSelectedNextStep(matchedRule.getNextStepId() != null ? matchedRule.getNextStepId().toString() : "END");
            execution.setCurrentStepId(matchedRule.getNextStepId());
            logRepository.save(log);
            executionRepository.save(execution);
            triggerStepExecution(execution.getId(), execution.getCurrentStepId(), "NEXT");
        } else {
            log.setStatus("FAILED");
            log.setErrorMessage("No matching rule found and no DEFAULT rule.");
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
        
        execution.setStatus(Execution.Status.IN_PROGRESS);
        execution.setRetries(execution.getRetries() + 1);
        executionRepository.save(execution);
        
        triggerStepExecution(executionId, execution.getCurrentStepId(), "RETRY");
    }
}
