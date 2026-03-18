package com.example.workflow.controller;

import com.example.workflow.dto.*;
import com.example.workflow.entity.*;
import com.example.workflow.service.WorkflowManagementService;
import com.example.workflow.dto.WorkflowLogDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class WorkflowManagementController {

    private final WorkflowManagementService workflowService;

    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'STUDENT', 'ADVISOR', 'HOD', 'PRINCIPAL', 'EMPLOYEE', 'MANAGER', 'FINANCE', 'CEO', 'HR')")
    @GetMapping("/workflows")
    public ResponseEntity<org.springframework.data.domain.Page<WorkflowListItemDto>> getAllWorkflows(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(workflowService.searchWorkflows(name, category, role, page, size));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'STUDENT', 'ADVISOR', 'HOD', 'PRINCIPAL', 'EMPLOYEE', 'MANAGER', 'FINANCE', 'CEO', 'HR')")
    @GetMapping("/workflows/available")
    public ResponseEntity<List<WorkflowListItemDto>> getAvailableWorkflows(
            @RequestParam UUID userId,
            @RequestParam String categoryFilter) {
        return ResponseEntity.ok(workflowService.getAvailableWorkflows(userId, categoryFilter));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/workflows/{id}/toggle-status")
    public ResponseEntity<Workflow> toggleStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(workflowService.toggleStatus(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/workflows")
    public ResponseEntity<Workflow> createWorkflow(@RequestBody CreateWorkflowRequest request) {
        return ResponseEntity.ok(workflowService.createWorkflow(request));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'STUDENT', 'ADVISOR', 'HOD', 'PRINCIPAL', 'EMPLOYEE', 'MANAGER', 'FINANCE', 'CEO', 'HR')")
    @GetMapping("/workflows/{id}")
    public ResponseEntity<WorkflowDetailsDto> getWorkflowDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(workflowService.getWorkflowDetails(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/workflows/{id}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable UUID id) {
        workflowService.deleteWorkflow(id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/workflows/{id}/publish")
    public ResponseEntity<Workflow> publishWorkflow(
            @PathVariable UUID id,
            @RequestBody PublishWorkflowRequest request) {
        return ResponseEntity.ok(workflowService.publishWorkflow(id, request));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'STUDENT', 'ADVISOR', 'HOD', 'PRINCIPAL', 'EMPLOYEE', 'MANAGER', 'FINANCE', 'CEO', 'HR')")
    @PostMapping("/workflows/{id}/execute")
    public ResponseEntity<WorkflowExecution> executeWorkflow(
            @PathVariable UUID id,
            @RequestBody(required = false) ExecuteWorkflowRequest request) {
        return ResponseEntity.ok(workflowService.executeWorkflow(id, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users/by-role")
    public ResponseEntity<List<User>> getUsersByRole(@RequestParam Role role) {
        return ResponseEntity.ok(workflowService.getUsersByRole(role));
    }

    // Phase 10: Refined Mapping Endpoints
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/workflow-mapping/{category}")
    public ResponseEntity<WorkflowUserMapping> getMappingByCategory(@PathVariable String category) {
        return workflowService.getMappingByCategory(category)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/workflow-mapping")
    public ResponseEntity<WorkflowUserMapping> saveWorkflowUserMapping(@RequestBody WorkflowUserMappingRequest request) {
        return ResponseEntity.ok(workflowService.saveWorkflowUserMapping(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/workflow-mapping/{category}")
    public ResponseEntity<WorkflowUserMapping> updateWorkflowUserMapping(
            @PathVariable String category,
            @RequestBody WorkflowUserMappingRequest request) {
        request.setWorkflowCategory(category);
        return ResponseEntity.ok(workflowService.saveWorkflowUserMapping(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/workflow-user-mappings")
    public ResponseEntity<List<WorkflowUserMapping>> getAllWorkflowUserMappings() {
        return ResponseEntity.ok(workflowService.getAllWorkflowUserMappings());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'STUDENT', 'ADVISOR', 'HOD', 'PRINCIPAL', 'EMPLOYEE', 'MANAGER', 'FINANCE', 'CEO', 'HR', 'SENIOR_DEVELOPER', 'PRODUCTION', 'REPORTING_MANAGER')")
    @GetMapping("/executions")
    public ResponseEntity<List<WorkflowExecution>> getAllExecutions(
            @RequestParam(required = false) UUID initiatorUserId,
            @RequestParam(required = false) UUID currentHandlerUserId,
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(workflowService.getAllExecutions(initiatorUserId, currentHandlerUserId, role));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'STUDENT', 'ADVISOR', 'HOD', 'PRINCIPAL', 'EMPLOYEE', 'MANAGER', 'FINANCE', 'CEO', 'HR')")
    @PostMapping("/executions/{id}/action")
    public ResponseEntity<WorkflowExecution> processAction(
            @PathVariable UUID id,
            @RequestBody ProcessActionRequest request) {
        return ResponseEntity.ok(workflowService.processAction(id, request.getAction(), request.getComment()));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'STUDENT', 'ADVISOR', 'HOD', 'PRINCIPAL', 'EMPLOYEE', 'MANAGER', 'FINANCE', 'CEO', 'HR')")
    @GetMapping("/executions/{id}/logs")
    public ResponseEntity<List<WorkflowLogDto>> getExecutionLogs(@PathVariable UUID id) {
        return ResponseEntity.ok(workflowService.getExecutionLogs(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/workflows/{id}/revert-to-draft")
    public ResponseEntity<Workflow> revertToDraft(@PathVariable UUID id) {
        return ResponseEntity.ok(workflowService.revertToDraft(id));
    }
}
