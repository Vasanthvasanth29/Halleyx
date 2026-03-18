package com.example.workflow.util;

import com.example.workflow.entity.*;
import com.example.workflow.repository.*;
import com.example.workflow.service.WorkflowManagementService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@Profile("test-workflow")
public class ExpenseWorkflowValidator implements CommandLineRunner {

    private final WorkflowManagementService workflowService;
    private final WorkflowRepository workflowRepository;
    private final UserRepository userRepository;

    public ExpenseWorkflowValidator(WorkflowManagementService workflowService, 
                                   WorkflowRepository workflowRepository,
                                   UserRepository userRepository) {
        this.workflowService = workflowService;
        this.workflowRepository = workflowRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        System.out.println("VALIDATOR: Starting Expense Workflow Validation...");
        try {
            User employee = userRepository.findByUsername("employee").orElseThrow();
            Workflow workflow = workflowRepository.findByCategoryIgnoreCase("EXPENSE_WORKFLOW").get(0);

            // Test 1: Amount < 10,000 (Should end after Manager)
            testFlow(workflow.getId(), employee.getId(), 5000.0, "TEST-1: Small Amount");

            // Test 2: 10,000 <= Amount < 50,000 (Should end after Finance)
            testFlow(workflow.getId(), employee.getId(), 25000.0, "TEST-2: Medium Amount");

            // Test 3: Amount >= 50,000 (Should end after CEO)
            testFlow(workflow.getId(), employee.getId(), 75000.0, "TEST-3: Large Amount");

            System.out.println("VALIDATOR: All tests completed.");
        } catch (Exception e) {
            System.err.println("VALIDATOR FAILED: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void testFlow(UUID workflowId, UUID initiatorId, Double amount, String label) {
        System.out.println("\n--- " + label + " (Amount: " + amount + ") ---");
        
        Map<String, Object> inputs = new HashMap<>();
        inputs.put("amount", amount);
        inputs.put("description", label);

        com.example.workflow.dto.ExecuteWorkflowRequest req = new com.example.workflow.dto.ExecuteWorkflowRequest();
        req.setInitiatorUserId(initiatorId);
        req.setInputs(inputs);

        WorkflowExecution execution = workflowService.executeWorkflow(workflowId, req);
        System.out.println("Execution Initialized: " + execution.getId());
        
        while (execution.getStatus() == ExecutionStatus.IN_PROGRESS || execution.getStatus() == ExecutionStatus.PENDING) {
            String currentRole = execution.getCurrentStep() != null ? execution.getCurrentStep().getAssignedRole() : "INITIATOR";
            System.out.println("Current Step: " + (execution.getCurrentStep() != null ? execution.getCurrentStep().getStepName() : "START") + " | Role: " + currentRole);
            
            String action = "APPROVE";
            if (currentRole.equals("EMPLOYEE")) action = "SUBMIT";
            
            System.out.println("Performing Action: " + action);
            execution = workflowService.processAction(execution.getId(), action, "Automated Approval");
            
            if (execution.getStatus() == ExecutionStatus.COMPLETED) {
                System.out.println("Status: COMPLETED");
                break;
            }
        }
    }
}
