package com.example.workflow.util;

import com.example.workflow.dto.CreateWorkflowRequest;
import com.example.workflow.entity.ExecutionStatus;
import com.example.workflow.entity.Workflow;
import com.example.workflow.entity.WorkflowExecution;
import com.example.workflow.service.WorkflowManagementService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@ComponentScan(basePackages = "com.example.workflow")
public class WorkflowTester {

    public static void testerMain(String[] args) {
        SpringApplication.run(WorkflowTester.class, args);
    }

//    @Bean
//    public CommandLineRunner test(WorkflowManagementService service) {
//        return args -> {
//            System.out.println("=== STARTING WORKFLOW VERIFICATION ===");
//
//            try {
//                // 1. Create the workflow
//                CreateWorkflowRequest request = new CreateWorkflowRequest();
//                request.setName("Employee Expense Approval TEST");
//                request.setCategory("EMPLOYEE_WORKFLOW");
//                request.setStatus("ACTIVE");
//                Workflow workflow = service.createWorkflow(request);
//                UUID wfId = workflow.getId();
//                System.out.println("Workflow created: " + wfId);
//
//                // 2. Test Case 1: Amount = 500 (Employee -> Manager -> Done)
//                System.out.println("\n--- Test Case 1: 500 ---");
//                testExecution(service, wfId, 500.0, "COMPLETED", "Manager Approval");
//
//                // 3. Test Case 2: Amount = 3000 (Employee -> Manager -> Finance -> Done)
//                System.out.println("\n--- Test Case 2: 3000 ---");
//                testExecution(service, wfId, 3000.0, "COMPLETED", "Finance Review");
//
//                // 4. Test Case 3: Amount = 7000 (Employee -> Manager -> Finance -> CEO -> Done)
//                System.out.println("\n--- Test Case 3: 7000 ---");
//                testExecution(service, wfId, 7000.0, "COMPLETED", "CEO Approval");
//
//                System.out.println("\n=== VERIFICATION COMPLETE ===");
//            } catch (Exception e) {
//                System.err.println("TESTER FAILED: " + e.getMessage());
//                e.printStackTrace();
//            }
//            System.exit(0);
//        };
//    }

    private void testExecution(WorkflowManagementService service, UUID wfId, Double amount, String expectedFinalStatus, String lastApprover) {
        Map<String, Object> inputs = new HashMap<>();
        inputs.put("expenseAmount", amount);
        inputs.put("employeeName", "Test User");

        com.example.workflow.dto.ExecuteWorkflowRequest executeRequest = new com.example.workflow.dto.ExecuteWorkflowRequest();
        executeRequest.setInputs(inputs);

        // 1. Initiate Workflow (starts at Employee Submission)
        WorkflowExecution execution = service.executeWorkflow(wfId, executeRequest);
        System.out.println("Started execution " + execution.getId() + " for amount: " + amount);
        
        try {
            // 2. Employee Responds (Action: SUBMIT) to move to Manager
            execution = service.processAction(execution.getId(), "SUBMIT", "Employee submitting expense");
            System.out.println("After Submission: " + (execution.getCurrentStep() != null ? "Move to " + execution.getCurrentStep().getStepName() : "DONE"));

            // 3. Manager Action
            execution = service.processAction(execution.getId(), "APPROVE", "Manager OK");
            System.out.println("After Manager Action: " + (execution.getStatus() == ExecutionStatus.COMPLETED ? "COMPLETED" : "Move to " + execution.getCurrentStep().getStepName()));
            
            if (amount > 1000 && execution.getStatus() != ExecutionStatus.COMPLETED) {
                // 4. Finance Action
                execution = service.processAction(execution.getId(), "APPROVE", "Finance OK");
                System.out.println("After Finance Action: " + (execution.getStatus() == ExecutionStatus.COMPLETED ? "COMPLETED" : "Move to " + execution.getCurrentStep().getStepName()));
            }

            if (amount > 5000 && execution.getStatus() != ExecutionStatus.COMPLETED) {
                // 5. CEO Action
                execution = service.processAction(execution.getId(), "APPROVE", "CEO OK");
                System.out.println("After CEO Action: " + (execution.getStatus() == ExecutionStatus.COMPLETED ? "COMPLETED" : "DONE"));
            }
            
            System.out.println("FINAL STATUS: " + execution.getStatus());
        } catch (Exception e) {
            System.err.println("Execution failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
