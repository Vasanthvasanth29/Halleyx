package com.halleyx.workflow.controller;

import com.halleyx.workflow.model.WorkflowStep;
import com.halleyx.workflow.repository.StepRepository;
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
@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
public class StepController {
    private final StepRepository stepRepository;

    @PostMapping("/workflows/{workflowId}/steps")
    public ResponseEntity<WorkflowStep> addStep(@PathVariable UUID workflowId, @RequestBody WorkflowStep step) {
        step.setWorkflowId(workflowId);
        return ResponseEntity.ok(stepRepository.save(step));
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
