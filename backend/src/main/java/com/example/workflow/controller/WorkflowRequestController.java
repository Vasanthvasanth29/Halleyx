package com.example.workflow.controller;

import com.example.workflow.dto.ExecuteWorkflowRequest;
import com.example.workflow.entity.WorkflowExecution;
import com.example.workflow.service.WorkflowManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class WorkflowRequestController {

    private final WorkflowManagementService workflowService;

    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'EMPLOYEE')")
    @PostMapping
    public ResponseEntity<WorkflowExecution> submitExpenseRequest(@RequestBody ExecuteWorkflowRequest request) {
        // Force category filter in service logic to ensure isolation if needed,
        // but here we just route to the service. The service will handle Expense-specific logic.
        return ResponseEntity.ok(workflowService.executeWorkflow(request.getWorkflowId(), request));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'EMPLOYEE')")
    @GetMapping("/my")
    public ResponseEntity<List<WorkflowExecution>> getMyExpenseRequests(@RequestParam UUID userId) {
        // Filter specifically for EXPENSE_WORKFLOW in the service
        return ResponseEntity.ok(workflowService.getMyExpenseExecutions(userId));
    }
}
