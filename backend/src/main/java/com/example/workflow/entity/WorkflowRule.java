package com.example.workflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.UUID;

@Entity
@Table(name = "proc_workflow_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Workflow workflow;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_id", nullable = false)
    private WorkflowStep step;

    @Column(name = "condition_action", nullable = false)
    private String condition; // e.g. "APPROVED", "REJECTED"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "next_step_id")
    private WorkflowStep nextStep; // nullable for END of workflow

    @Column(name = "condition_value", nullable = false)
    @Builder.Default
    private String conditionValue = "DEFAULT";

    @Column(nullable = false)
    @Builder.Default
    private Integer priority = 0;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = false;
}
