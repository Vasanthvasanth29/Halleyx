package com.example.workflow.dto;

import com.example.workflow.entity.WorkflowStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowListItemDto {
    private UUID id;
    private String name;
    private String category;
    private WorkflowStatus status;
    private Integer version;
    private LocalDateTime createdAt;
    private long stepCount;
    private long executionCount;
    private String description;
}
