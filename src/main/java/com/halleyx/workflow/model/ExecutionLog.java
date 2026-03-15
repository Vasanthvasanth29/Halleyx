package com.halleyx.workflow.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "execution_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecutionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "execution_id", nullable = false)
    private UUID executionId;

    @Column(name = "step_name")
    private String stepName;

    @Column(name = "step_type")
    private String stepType;

    @Column(name = "evaluated_rules", columnDefinition = "TEXT")
    private String evaluatedRules;

    @Column(name = "selected_next_step")
    private String selectedNextStep;

    @Column(nullable = false)
    private String status;

    @Column(name = "approver_id")
    private String approverId;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @CreationTimestamp
    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;
}
