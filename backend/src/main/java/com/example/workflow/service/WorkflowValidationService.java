package com.example.workflow.service;

import com.example.workflow.dto.PublishWorkflowRequest;
import com.example.workflow.entity.StepType;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class WorkflowValidationService {

    public void validate(PublishWorkflowRequest request, String category) {
        List<PublishWorkflowRequest.StepDto> steps = request.getSteps();

        if (steps == null || steps.isEmpty()) {
            System.err.println("Validation Warning: Workflow must have at least one step.");
            return;
        }

        boolean hasStartStep = steps.stream().anyMatch(s -> s.getStepOrder() != null && s.getStepOrder() == 1);
        if (!hasStartStep) {
            System.err.println("Validation Warning: Workflow must have a START step (Step Order 1).");
        }

        long endStepCount = steps.stream().filter(s -> s.getStepType() == StepType.END).count();
        if (endStepCount != 1) {
            System.err.println("Validation Warning: Workflow must have exactly one END step.");
        }

        Set<String> tempIds = steps.stream().map(PublishWorkflowRequest.StepDto::getTempId).collect(Collectors.toSet());

        boolean isExpenseWorkflow = "EXPENSE_WORKFLOW".equalsIgnoreCase(category);

        for (PublishWorkflowRequest.StepDto step : steps) {
            if (step.getStepType() != StepType.END) {
                if (step.getRules() == null || step.getRules().isEmpty()) {
                    System.err.println("Validation Warning: Step '" + step.getStepName() + "' must have at least one transition rule.");
                }

                boolean hasDefaultRule = false;
                if (step.getRules() != null) {
                    for (PublishWorkflowRequest.RuleDto rule : step.getRules()) {
                        // Rule validation
                        if (rule.getNextStepTempId() == null || rule.getNextStepTempId().isBlank()) {
                            System.err.println("Validation Warning: Step '" + step.getStepName() + "' has a rule with no destination step.");
                        }
                        if (rule.getNextStepTempId() != null && !tempIds.contains(rule.getNextStepTempId())) {
                            System.err.println("Validation Warning: Step '" + step.getStepName() + "' has a rule pointing to an invalid next step.");
                        }

                        boolean isDefault = "DEFAULT".equalsIgnoreCase(rule.getConditionValue()) || 
                                           "DEFAULT".equalsIgnoreCase(rule.getConditionAction());
                        if (isDefault) {
                            hasDefaultRule = true;
                        }

                        // Strict validation ONLY for Expense Workflow
                        if (isExpenseWorkflow && step.getStepType() == StepType.APPROVAL) {
                            if (!isDefault) {
                                // Check for empty condition components in Expense Workflow
                                // Note: conditionValue in DTO is used for the expression string (e.g., amount < 10000)
                                if (rule.getConditionValue() == null || rule.getConditionValue().trim().isEmpty()) {
                                    System.err.println("Validation Warning: Expense workflow नियम incomplete. Please configure all rules.");
                                }
                            }
                        }
                    }
                }

                if (isExpenseWorkflow && step.getStepType() == StepType.APPROVAL) {
                    if (step.getRules() == null || (step.getRules().isEmpty() && !hasDefaultRule)) {
                        System.err.println("Validation Warning: Expense workflow नियम incomplete. Please configure all rules.");
                    }
                }
            }
        }
    }
}
