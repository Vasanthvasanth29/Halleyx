package com.example.workflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.UUID;

@Entity
@Table(name = "proc_workflow_fields")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowInputField {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Workflow workflow;

    @Column(nullable = false)
    private String fieldName;

    @Column(nullable = false)
    private String fieldType; // TEXT, NUMBER, DATE, DROPDOWN

    @Column(nullable = false)
    private boolean required;

    @Column(columnDefinition = "TEXT")
    private String allowedValues; // Comma-separated values for DROPDOWN
}
