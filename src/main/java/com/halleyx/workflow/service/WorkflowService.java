package com.halleyx.workflow.service;

import com.halleyx.workflow.model.Rule;
import com.halleyx.workflow.model.Workflow;
import com.halleyx.workflow.model.WorkflowStep;
import com.halleyx.workflow.repository.RuleRepository;
import com.halleyx.workflow.repository.StepRepository;
import com.halleyx.workflow.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class WorkflowService {
    private final WorkflowRepository workflowRepository;
    private final StepRepository stepRepository;
    private final RuleRepository ruleRepository;

    public Workflow createWorkflow(Workflow workflow) {
        // PRODUCTION REQUIREMENT 1: 0 steps -> DRAFT
        validateStatus(workflow);
        return workflowRepository.save(workflow);
    }

    @Transactional
    public Workflow updateWithVersioning(UUID id, Workflow workflowDetails) {
        Workflow oldWorkflow = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        // Mark previous version as inactive
        oldWorkflow.setActive(false);
        workflowRepository.save(oldWorkflow);

        // Create new version record
        Workflow newWorkflow = Workflow.builder()
                .name(workflowDetails.getName())
                .version(oldWorkflow.getVersion() + 1)
                .inputSchema(workflowDetails.getInputSchema())
                .maxIterations(workflowDetails.getMaxIterations() != null ? workflowDetails.getMaxIterations() : oldWorkflow.getMaxIterations())
                .active(workflowDetails.getActive() != null ? workflowDetails.getActive() : true)
                .build();
        
        // Final validation before saving new version
        validateStatus(newWorkflow);
        newWorkflow = workflowRepository.save(newWorkflow);
        
        final UUID newWorkflowId = newWorkflow.getId();

        // Production Deep Copy logic moved from controller
        List<WorkflowStep> oldSteps = stepRepository.findByWorkflowIdOrderByOrderAsc(id);
        Map<UUID, UUID> stepIdMap = new HashMap<>(); // oldId -> newId

        for (WorkflowStep oldStep : oldSteps) {
            WorkflowStep newStep = WorkflowStep.builder()
                    .workflowId(newWorkflowId)
                    .name(oldStep.getName())
                    .stepType(oldStep.getStepType())
                    .order(oldStep.getOrder())
                    .metadata(oldStep.getMetadata())
                    .maxRetries(oldStep.getMaxRetries())
                    .build();
            newStep = stepRepository.save(newStep);
            stepIdMap.put(oldStep.getId(), newStep.getId());

            // Copy rules
            List<Rule> oldRules = ruleRepository.findByStepIdOrderByPriorityAsc(oldStep.getId());
            for (Rule oldRule : oldRules) {
                Rule newRule = Rule.builder()
                        .stepId(newStep.getId())
                        .condition(oldRule.getCondition())
                        .nextStepId(oldRule.getNextStepId()) // Temporary old ID
                        .priority(oldRule.getPriority())
                        .build();
                ruleRepository.save(newRule);
            }
        }

        // Remap Pointers (Workflow start and Rule next_step)
        if (oldWorkflow.getStartStepId() != null) {
            newWorkflow.setStartStepId(stepIdMap.get(oldWorkflow.getStartStepId()));
        }

        // PRODUCTION FIX: Re-validate status AFTER steps are copied
        // Pass the count of copied steps to avoid flush-related race conditions
        validateStatus(newWorkflow, (long) oldSteps.size());
        newWorkflow = workflowRepository.save(newWorkflow);

        for (UUID newStepId : stepIdMap.values()) {
            List<Rule> newRules = ruleRepository.findByStepIdOrderByPriorityAsc(newStepId);
            for (Rule rule : newRules) {
                if (rule.getNextStepId() != null && stepIdMap.containsKey(rule.getNextStepId())) {
                    rule.setNextStepId(stepIdMap.get(rule.getNextStepId()));
                    ruleRepository.save(rule);
                }
            }
        }
        
        return newWorkflow;
    }

    private void validateStatus(Workflow workflow) {
        validateStatus(workflow, null);
    }

    private void validateStatus(Workflow workflow, Long forcedCount) {
        if (workflow.getId() == null) {
            workflow.setActive(false); // New workflow starts as draft
            return;
        }
        
        long stepCount = (forcedCount != null) ? forcedCount : stepRepository.countByWorkflowId(workflow.getId());
        if (stepCount == 0) {
            workflow.setActive(false); // Force draft if no steps
        }
    }
}
