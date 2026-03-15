package com.halleyx.workflow.controller;

import com.halleyx.workflow.dto.WorkflowResponseDTO;
import com.halleyx.workflow.model.Workflow;
import com.halleyx.workflow.repository.StepRepository;
import com.halleyx.workflow.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WorkflowController {
    private final WorkflowRepository workflowRepository;
    private final StepRepository stepRepository;

    @PostMapping
    public ResponseEntity<Workflow> createWorkflow(@RequestBody Workflow workflow) {
        return ResponseEntity.ok(workflowRepository.save(workflow));
    }

    @GetMapping
    public ResponseEntity<Page<WorkflowResponseDTO>> getAllWorkflows(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Workflow> workflowPage;
        if (search != null && !search.isEmpty()) {
            workflowPage = workflowRepository.findByNameContainingIgnoreCase(search, pageable);
        } else {
            workflowPage = workflowRepository.findAll(pageable);
        }
        
        Page<WorkflowResponseDTO> dtoPage = workflowPage.map(wf -> 
            WorkflowResponseDTO.from(wf, stepRepository.countByWorkflowId(wf.getId()))
        );
        
        return ResponseEntity.ok(dtoPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Workflow> getWorkflow(@PathVariable UUID id) {
        return workflowRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Workflow> updateWorkflow(@PathVariable UUID id, @RequestBody Workflow workflowDetails) {
        return workflowRepository.findById(id).map(workflow -> {
            workflow.setName(workflowDetails.getName());
            workflow.setVersion(workflow.getVersion() + 1);
            workflow.setInputSchema(workflowDetails.getInputSchema());
            workflow.setStartStepId(workflowDetails.getStartStepId());
            workflow.setIsActive(workflowDetails.getIsActive());
            return ResponseEntity.ok(workflowRepository.save(workflow));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable UUID id) {
        workflowRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
