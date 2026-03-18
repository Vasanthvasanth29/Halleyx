package com.example.workflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import java.util.UUID;

@Entity
@Table(name = "proc_workflow_steps")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class WorkflowStep {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "workflow_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Workflow workflow;

    @Column(name = "step_name", nullable = false)
    private String stepName;

    @Enumerated(EnumType.STRING)
    @Column(name = "step_type", nullable = false)
    private StepType stepType;

    @Column(name = "assigned_role", nullable = true)
    private String assignedRole;

    @Column(name = "allowed_actions")
    private String allowedActions; // Comma separated actions e.g. "APPROVE,REJECT"

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;
}
