package com.example.workflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "action_type", nullable = false)
    private String actionType;

    @Column(name = "workflow_category")
    private String workflowCategory;

    @Column(name = "workflow_name")
    private String workflowName;

    @Column(name = "performed_by_user_id")
    private UUID performedByUserId;

    @Column(name = "performer_name")
    private String performerName;

    @Column(name = "performed_by_role")
    private String performedByRole;

    @Column(name = "action_description", columnDefinition = "TEXT")
    private String actionDescription;

    @Column(name = "execution_id")
    private UUID executionId;

    @Column(nullable = false)
    private String status; // SUCCESS / FAILED

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
