package com.halleyx.workflow.controller;

import com.halleyx.workflow.model.Execution;
import com.halleyx.workflow.model.ExecutionLog;
import com.halleyx.workflow.repository.ExecutionLogRepository;
import com.halleyx.workflow.repository.ExecutionRepository;
import com.halleyx.workflow.security.UserDetailsImpl;
import com.halleyx.workflow.service.WorkflowEngine;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExecutionController {
    private final WorkflowEngine workflowEngine;
    private final ExecutionRepository executionRepository;
    private final ExecutionLogRepository logRepository;

    @PostMapping("/workflows/{workflowId}/execute")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<Execution> startExecution(@PathVariable UUID workflowId, @RequestBody ExecutionRequest request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Execution execution = workflowEngine.startExecution(workflowId, request.getData(), userDetails.getId());
        return ResponseEntity.ok(execution);
    }

    @GetMapping("/executions")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<Page<Execution>> listExecutions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(executionRepository.findAll(PageRequest.of(page, size)));
    }

    @GetMapping("/executions/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ExecutionResponse> getExecution(@PathVariable UUID id) {
        return executionRepository.findById(id).map(execution -> {
            List<ExecutionLog> logs = logRepository.findByExecutionIdOrderByStartedAtAsc(id);
            ExecutionResponse response = new ExecutionResponse();
            response.setExecution(execution);
            response.setLogs(logs);
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/executions/{id}/approve")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<Void> approveExecution(@PathVariable UUID id) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        workflowEngine.approveStep(id, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/executions/{id}/cancel")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<Void> cancelExecution(@PathVariable UUID id) {
        workflowEngine.cancelExecution(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/executions/{id}/retry")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<Void> retryExecution(@PathVariable UUID id) {
        workflowEngine.retryExecution(id);
        return ResponseEntity.ok().build();
    }

    @Data
    public static class ExecutionRequest {
        private String data;
    }

    @Data
    public static class ExecutionResponse {
        private Execution execution;
        private List<ExecutionLog> logs;
    }
}
