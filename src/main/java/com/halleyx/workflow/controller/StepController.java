package com.halleyx.workflow.controller;

import com.halleyx.workflow.model.WorkflowStep;
import com.halleyx.workflow.repository.StepRepository;
import com.halleyx.workflow.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StepController {
    private final StepRepository stepRepository;
    private final WorkflowRepository workflowRepository;

    @PostMapping("/workflows/{workflowId}/steps")
    public ResponseEntity<WorkflowStep> addStep(@PathVariable UUID workflowId, @RequestBody WorkflowStep step) {
        step.setWorkflowId(workflowId);
        WorkflowStep savedStep = stepRepository.save(step);
        
        // Auto-set start step if not already set
        workflowRepository.findById(workflowId).ifPresent(workflow -> {
            if (workflow.getStartStepId() == null) {
                workflow.setStartStepId(savedStep.getId());
                workflow.setVersion(workflow.getVersion() + 1);
                workflowRepository.save(workflow);
            }
        });
        
        return ResponseEntity.ok(savedStep);
    }

    @GetMapping("/workflows/{workflowId}/steps")
    public ResponseEntity<List<WorkflowStep>> getSteps(@PathVariable UUID workflowId) {
        return ResponseEntity.ok(stepRepository.findByWorkflowIdOrderByOrderAsc(workflowId));
    }

    @PutMapping("/steps/{id}")
    public ResponseEntity<WorkflowStep> updateStep(@PathVariable UUID id, @RequestBody WorkflowStep stepDetails) {
        return stepRepository.findById(id).map(step -> {
            step.setName(stepDetails.getName());
            step.setStepType(stepDetails.getStepType());
            step.setOrder(stepDetails.getOrder());
            step.setMetadata(stepDetails.getMetadata());
            return ResponseEntity.ok(stepRepository.save(step));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/steps/{id}")
    public ResponseEntity<Void> deleteStep(@PathVariable UUID id) {
        stepRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
