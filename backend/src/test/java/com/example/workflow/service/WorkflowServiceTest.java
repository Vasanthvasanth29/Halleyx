package com.example.workflow.service;

import com.example.workflow.entity.*;
import com.example.workflow.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WorkflowServiceTest {

    @Mock private WorkflowRepository workflowRepository;
    @Mock private WorkflowStepRepository stepRepository;
    @Mock private WorkflowRuleRepository ruleRepository;
    @Mock private WorkflowExecutionRepository executionRepository;
    @Mock private WorkflowLogRepository logRepository;
    @Mock private WorkflowUserMappingRepository workflowUserMappingRepository;
    @Mock private AuditLogService auditLogService;
    @Mock private RabbitMQProducer rabbitMQProducer;

    @InjectMocks
    private WorkflowManagementService workflowService;

    private Workflow workflow;
    private User student, advisor, hod, principal;
    private WorkflowUserMapping mapping;
    private List<WorkflowStep> steps;

    @BeforeEach
    void setUp() {
        workflow = Workflow.builder()
                .id(UUID.randomUUID())
                .name("OD Permission")
                .category("student_workflow_engine")
                .status(WorkflowStatus.ACTIVE)
                .build();

        student = User.builder().id(UUID.randomUUID()).username("student").role(Role.USER).build();
        advisor = User.builder().id(UUID.randomUUID()).username("advisor").role(Role.USER).build();
        hod = User.builder().id(UUID.randomUUID()).username("hod").role(Role.USER).build();
        principal = User.builder().id(UUID.randomUUID()).username("principal").role(Role.USER).build();

        mapping = WorkflowUserMapping.builder()
                .workflowCategory("student_workflow_engine")
                .level1Role("STUDENT")
                .level1User(student)
                .level2Role("ADVISOR")
                .level2User(advisor)
                .level3Role("HOD")
                .level3User(hod)
                .level4Role("PRINCIPAL")
                .level4User(principal)
                .build();

        WorkflowStep s1 = WorkflowStep.builder().id(UUID.randomUUID()).stepName("Submission").stepOrder(1).assignedRole("STUDENT").stepType(StepType.TASK).build();
        WorkflowStep s2 = WorkflowStep.builder().id(UUID.randomUUID()).stepName("Advisor Review").stepOrder(2).assignedRole("ADVISOR").stepType(StepType.APPROVAL).build();
        WorkflowStep s3 = WorkflowStep.builder().id(UUID.randomUUID()).stepName("HOD Approval").stepOrder(3).assignedRole("HOD").stepType(StepType.APPROVAL).build();
        WorkflowStep s4 = WorkflowStep.builder().id(UUID.randomUUID()).stepName("Principal Approval").stepOrder(4).assignedRole("PRINCIPAL").stepType(StepType.APPROVAL).build();
        WorkflowStep s5 = WorkflowStep.builder().id(UUID.randomUUID()).stepName("End").stepOrder(5).stepType(StepType.END).build();
        steps = Arrays.asList(s1, s2, s3, s4, s5);
    }

    @Test
    void testExecuteWorkflow_Success() {
        when(workflowRepository.findById(any())).thenReturn(Optional.of(workflow));
        when(stepRepository.findByWorkflowIdOrderByStepOrderAsc(any())).thenReturn(steps);
        when(workflowUserMappingRepository.findByWorkflowCategoryIgnoreCase(any())).thenReturn(Optional.of(mapping));
        when(executionRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        WorkflowExecution execution = workflowService.executeWorkflow(workflow.getId(), null);

        assertNotNull(execution);
        assertEquals(ExecutionStatus.IN_PROGRESS, execution.getStatus());
        assertEquals(student.getId(), execution.getInitiatorUserId());
        assertEquals(steps.get(0), execution.getCurrentStep());
        verify(rabbitMQProducer, times(1)).sendWorkflowExecutionEvent(any());
    }

    @Test
    void testProcessAction_FullApprovalFlow() {
        // 1. Initial State: At HOD Approval
        WorkflowExecution execution = WorkflowExecution.builder()
                .id(UUID.randomUUID())
                .workflow(workflow)
                .status(ExecutionStatus.IN_PROGRESS)
                .currentStep(steps.get(2)) // HOD
                .initiatorUserId(student.getId())
                .currentHandlerUserId(hod.getId())
                .build();

        WorkflowRule ruleHOD = WorkflowRule.builder()
                .condition("APPROVE")
                .nextStep(steps.get(3)) // To Principal
                .build();

        when(executionRepository.findById(any())).thenReturn(Optional.of(execution));
        when(ruleRepository.findByStepIdOrderByPriorityAsc(eq(steps.get(2).getId()))).thenReturn(Collections.singletonList(ruleHOD));
        when(workflowUserMappingRepository.findByWorkflowCategoryIgnoreCase(any())).thenReturn(Optional.of(mapping));
        when(executionRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        // Action: HOD Approve
        WorkflowExecution updatedToPrincipal = workflowService.processAction(execution.getId(), "APPROVE", "HOD Recommended");

        assertEquals(steps.get(3), updatedToPrincipal.getCurrentStep());
        assertEquals(principal.getId(), updatedToPrincipal.getCurrentHandlerUserId());

        // 2. Action: Principal Approve
        WorkflowRule rulePrincipal = WorkflowRule.builder()
                .condition("APPROVE")
                .nextStep(steps.get(4)) // To End
                .build();

        when(executionRepository.findById(any())).thenReturn(Optional.of(updatedToPrincipal));
        when(ruleRepository.findByStepIdOrderByPriorityAsc(eq(steps.get(3).getId()))).thenReturn(Collections.singletonList(rulePrincipal));

        WorkflowExecution completed = workflowService.processAction(updatedToPrincipal.getId(), "APPROVE", "Final Sanction");

        assertEquals(ExecutionStatus.COMPLETED, completed.getStatus());
        assertNull(completed.getCurrentStep());
        assertNull(completed.getCurrentHandlerUserId());
    }

    @Test
    void testProcessAction_ExpenseWorkflowFlow() {
        // Employee -> Manager -> Finance -> CEO -> Completed
        User manager = User.builder().id(UUID.randomUUID()).username("manager").role(Role.MANAGER).build();
        User finance = User.builder().id(UUID.randomUUID()).username("finance").role(Role.FINANCE).build();
        User ceo = User.builder().id(UUID.randomUUID()).username("ceo").role(Role.CEO).build();

        WorkflowUserMapping expenseMapping = WorkflowUserMapping.builder()
                .workflowCategory("expense_workflow_engine")
                .level1Role("USER")
                .level1User(student) // reusing student as employee
                .level2Role("MANAGER")
                .level2User(manager)
                .level3Role("FINANCE")
                .level3User(finance)
                .level4Role("CEO")
                .level4User(ceo)
                .build();

        WorkflowStep.builder().id(UUID.randomUUID()).stepName("Submission").stepOrder(1).assignedRole("USER").stepType(StepType.TASK).build();
        WorkflowStep.builder().id(UUID.randomUUID()).stepName("Manager Approval").stepOrder(2).assignedRole("MANAGER").stepType(StepType.APPROVAL).build();
        WorkflowStep e3 = WorkflowStep.builder().id(UUID.randomUUID()).stepName("Finance Approval").stepOrder(3).assignedRole("FINANCE").stepType(StepType.APPROVAL).build();
        WorkflowStep e4 = WorkflowStep.builder().id(UUID.randomUUID()).stepName("CEO Approval").stepOrder(4).assignedRole("CEO").stepType(StepType.APPROVAL).build();
        WorkflowStep.builder().id(UUID.randomUUID()).stepName("End").stepOrder(5).stepType(StepType.END).build();

        WorkflowExecution execution = WorkflowExecution.builder()
                .id(UUID.randomUUID())
                .workflow(workflow)
                .status(ExecutionStatus.IN_PROGRESS)
                .currentStep(e3) // At Finance stage
                .initiatorUserId(student.getId())
                .currentHandlerUserId(finance.getId())
                .build();

        WorkflowRule nextRule = WorkflowRule.builder().condition("APPROVE").nextStep(e4).build();

        when(executionRepository.findById(any())).thenReturn(Optional.of(execution));
        when(ruleRepository.findByStepIdOrderByPriorityAsc(eq(e3.getId()))).thenReturn(Collections.singletonList(nextRule));
        when(workflowUserMappingRepository.findByWorkflowCategoryIgnoreCase(any())).thenReturn(Optional.of(expenseMapping));
        when(executionRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        WorkflowExecution updated = workflowService.processAction(execution.getId(), "APPROVE", "Finance OK");

        assertEquals(e4, updated.getCurrentStep());
        assertEquals(ceo.getId(), updated.getCurrentHandlerUserId());
    }

    @Test
    void testProcessAction_StudentWorkflow_DynamicRouting() {
        // Step 1: Student Submission
        WorkflowStep s1 = steps.get(0);
        WorkflowStep s2 = steps.get(1); // Advisor
        WorkflowStep s3 = steps.get(2); // HOD

        WorkflowRule rOD = WorkflowRule.builder().condition("SUBMIT").conditionValue("requestType == 'OD'").nextStep(s2).priority(10).build();
        WorkflowRule rLongLeave = WorkflowRule.builder().condition("SUBMIT").conditionValue("requestType == 'LEAVE' AND days > 7").nextStep(s3).priority(5).build();
        WorkflowRule rDefault = WorkflowRule.builder().condition("SUBMIT").conditionValue("DEFAULT").nextStep(s2).priority(0).build();

        List<WorkflowRule> s1Rules = Arrays.asList(rOD, rLongLeave, rDefault);

        // Case 1: OD Request -> Advisor
        WorkflowExecution exOD = WorkflowExecution.builder()
                .id(UUID.randomUUID()).workflow(workflow).status(ExecutionStatus.IN_PROGRESS).currentStep(s1).requestType("OD").build();
        
        when(executionRepository.findById(eq(exOD.getId()))).thenReturn(Optional.of(exOD));
        when(ruleRepository.findByStepIdOrderByPriorityAsc(eq(s1.getId()))).thenReturn(s1Rules);
        when(workflowUserMappingRepository.findByWorkflowCategoryIgnoreCase(any())).thenReturn(Optional.of(mapping));
        when(executionRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        WorkflowExecution resOD = workflowService.processAction(exOD.getId(), "SUBMIT", "OD req");
        assertEquals(s2, resOD.getCurrentStep());

        // Case 2: Long Leave (>7 days) -> HOD
        WorkflowExecution exLong = WorkflowExecution.builder()
                .id(UUID.randomUUID()).workflow(workflow).status(ExecutionStatus.IN_PROGRESS).currentStep(s1).requestType("LEAVE").leaveDays(10).build();
        
        when(executionRepository.findById(eq(exLong.getId()))).thenReturn(Optional.of(exLong));
        WorkflowExecution resLong = workflowService.processAction(exLong.getId(), "SUBMIT", "Long leave");
        assertEquals(s3, resLong.getCurrentStep());

        // Case 3: Short Leave (<=7 days) -> DEFAULT -> Advisor
        WorkflowExecution exShort = WorkflowExecution.builder()
                .id(UUID.randomUUID()).workflow(workflow).status(ExecutionStatus.IN_PROGRESS).currentStep(s1).requestType("LEAVE").leaveDays(3).build();
        
        when(executionRepository.findById(eq(exShort.getId()))).thenReturn(Optional.of(exShort));
        WorkflowExecution resShort = workflowService.processAction(exShort.getId(), "SUBMIT", "Short leave");
        assertEquals(s2, resShort.getCurrentStep());
    }

    @Test
    void testProcessAction_RejectBackToEmployee() {
        WorkflowExecution execution = WorkflowExecution.builder()
                .id(UUID.randomUUID())
                .workflow(workflow)
                .status(ExecutionStatus.IN_PROGRESS)
                .currentStep(steps.get(1)) // At Advisor Review
                .initiatorUserId(student.getId())
                .currentHandlerUserId(advisor.getId())
                .build();

        when(executionRepository.findById(any())).thenReturn(Optional.of(execution));
        when(stepRepository.findByWorkflowIdOrderByStepOrderAsc(any())).thenReturn(steps);
        when(executionRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        WorkflowExecution updated = workflowService.processAction(execution.getId(), "REJECT", "Incomplete");

        assertEquals(ExecutionStatus.REJECTED, updated.getStatus());
        assertEquals(steps.get(0), updated.getCurrentStep());
        assertEquals(student.getId(), updated.getCurrentHandlerUserId());
    }
}
