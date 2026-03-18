package com.example.workflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "proc_workflow_executions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class WorkflowExecution {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "workflow_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Workflow workflow;

    @Column(name = "initiator_user_id", nullable = false)
    private UUID initiatorUserId;

    @Column(name = "current_handler_user_id")
    private UUID currentHandlerUserId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "current_step_id")
    private WorkflowStep currentStep;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExecutionStatus status;

    @CreationTimestamp
    @Column(name = "started_at", updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Student Workflow Form Fields
    @Column(name = "request_type")
    private String requestType;

    @Column(name = "reason", length = 1000)
    private String reason;

    @Column(name = "from_date")
    private java.time.LocalDate fromDate;

    @Column(name = "to_date")
    private java.time.LocalDate toDate;

    @Column(name = "leave_days")
    private Integer leaveDays;

    // Employee Expense Workflow Fields
    @Column(name = "employee_name")
    private String employeeName;

    @Column(name = "employee_id")
    private String employeeId;

    @Column(name = "department")
    private String department;

    @Column(name = "expense_amount")
    private Double expenseAmount;

    @Column(name = "expense_type")
    private String expenseType;

    @Column(name = "expense_description", length = 1000)
    private String expenseDescription;

    @Column(name = "priority")
    private String priority;
}
