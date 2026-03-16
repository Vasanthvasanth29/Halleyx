package com.halleyx.workflow.controller;

import com.halleyx.workflow.service.WorkflowService;
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
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import org.springframework.transaction.annotation.Transactional;
import com.halleyx.workflow.model.WorkflowStep;
import com.halleyx.workflow.model.Rule;
import com.halleyx.workflow.repository.RuleRepository;
import java.util.*;

@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WorkflowController {
    private final WorkflowRepository workflowRepository;
    private final StepRepository stepRepository;
    private final RuleRepository ruleRepository;
    private final WorkflowService workflowService;

    @PostMapping
    public ResponseEntity<Workflow> createWorkflow(@RequestBody Workflow workflow) {
        return ResponseEntity.ok(workflowService.createWorkflow(workflow));
    }

    @GetMapping
    public ResponseEntity<Page<WorkflowResponseDTO>> getAllWorkflows(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, 
            Sort.by(Sort.Direction.DESC, "active")
                .and(Sort.by(Sort.Direction.DESC, "version"))
                .and(Sort.by(Sort.Direction.DESC, "updatedAt")));
        Page<Workflow> workflowPage;
        if (name != null && !name.isEmpty()) {
            if (active != null) {
                workflowPage = workflowRepository.findByActiveAndNameContainingIgnoreCase(active, name, pageable);
            } else {
                workflowPage = workflowRepository.findByNameContainingIgnoreCase(name, pageable);
            }
        } else {
            if (active != null) {
                workflowPage = workflowRepository.findByActive(active, pageable);
            } else {
                workflowPage = workflowRepository.findAll(pageable);
            }
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
        return ResponseEntity.ok(workflowService.updateWithVersioning(id, workflowDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable UUID id) {
        workflowRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
