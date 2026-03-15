package com.halleyx.workflow.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rule {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "step_id", nullable = false)
    private UUID stepId;

    @Column(nullable = false)
    private String condition;

    @Column(name = "next_step_id")
    private UUID nextStepId;

    @Column(nullable = false)
    private Integer priority;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
