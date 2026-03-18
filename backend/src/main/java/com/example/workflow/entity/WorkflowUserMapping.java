package com.example.workflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "proc_workflow_user_mappings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowUserMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "workflow_category", nullable = false, unique = true)
    private String workflowCategory;

    // Level 1
    private String level1Role;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "level_1_user_id")
    private User level1User;

    // Level 2
    private String level2Role;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "level_2_user_id")
    private User level2User;

    // Level 3
    private String level3Role;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "level_3_user_id")
    private User level3User;

    // Level 4
    private String level4Role;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "level_4_user_id")
    private User level4User;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
