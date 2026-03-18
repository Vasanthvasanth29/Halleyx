package com.example.workflow;

import com.example.workflow.entity.*;
import com.example.workflow.repository.*;
import com.example.workflow.service.WorkflowManagementService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ExpenseWorkflowIntegrationTest {

    @Autowired
    private WorkflowManagementService workflowService;

    @Autowired
    private WorkflowRepository workflowRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testExpenseWorkflowSelfHealing() {
        User employee = userRepository.findByUsername("employee").orElseThrow();
        Workflow workflow = workflowRepository.findByCategoryIgnoreCase("EXPENSE_WORKFLOW").get(0);

        // Scenario 1: Amount < 10,000 (Should end after Manager approval)
        UUID executionId = runFlow(workflow.getId(), employee.getId(), 5000.0);
        WorkflowExecution execution = workflowService.getExecutionById(executionId); // Need this method
        assertEquals(ExecutionStatus.COMPLETED, execution.getStatus());
        
        // Scenario 2: 10,000 <= Amount < 50,000 (Should end after Finance approval)
        executionId = runFlow(workflow.getId(), employee.getId(), 25000.0);
        execution = workflowService.getExecutionById(executionId);
        assertEquals(ExecutionStatus.COMPLETED, execution.getStatus());

        // Scenario 3: Amount >= 50,000 (Should end after CEO approval)
        executionId = runFlow(workflow.getId(), employee.getId(), 75000.0);
        execution = workflowService.getExecutionById(executionId);
        assertEquals(ExecutionStatus.COMPLETED, execution.getStatus());
    }

    private UUID runFlow(UUID workflowId, UUID initiatorId, Double amount) {
        Map<String, Object> inputs = new HashMap<>();
        inputs.put("amount", amount);
        
        com.example.workflow.dto.ExecuteWorkflowRequest req = new com.example.workflow.dto.ExecuteWorkflowRequest();
        req.setInitiatorUserId(initiatorId);
        req.setInputs(inputs);

        WorkflowExecution execution = workflowService.executeWorkflow(workflowId, req);
        
        int safetyCounter = 0;
        while (execution.getStatus() != ExecutionStatus.COMPLETED && execution.getStatus() != ExecutionStatus.REJECTED && safetyCounter < 10) {
            execution = workflowService.processAction(execution.getId(), "APPROVE", "Automated Approval");
            safetyCounter++;
        }
        return execution.getId();
    }
}
