package com.example.workflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "proc_workflow_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "execution_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private WorkflowExecution execution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_id")
    private WorkflowStep step;

    @Column(name = "action_taken_by_user_id")
    private UUID actionTakenByUserId;

    @Column(name = "action_type", nullable = false)
    private String actionType;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;
}
