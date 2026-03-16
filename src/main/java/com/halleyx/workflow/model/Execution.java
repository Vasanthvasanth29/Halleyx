package com.halleyx.workflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "executions", indexes = {
    @Index(name = "idx_execution_workflow_id", columnList = "workflow_id"),
    @Index(name = "idx_execution_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Execution {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "workflow_id", nullable = false)
    private UUID workflowId;

    @Column(name = "workflow_version", nullable = false)
    private Integer workflowVersion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(columnDefinition = "TEXT")
    private String data;

    @Column(name = "current_step_id")
    private UUID currentStepId;

    @Builder.Default
    private Integer retries = 0;

    @Column(name = "iteration_count")
    @Builder.Default
    private Integer iterationCount = 0;

    @Column(name = "triggered_by")
    private UUID triggeredBy;

    @Column(name = "triggered_by_username")
    private String triggeredByUsername;

    @CreationTimestamp
    @Column(name = "started_at", updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    public enum Status {
        PENDING, IN_PROGRESS, COMPLETED, FAILED, CANCELED
    }
}
