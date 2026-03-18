package com.example.workflow.dto;

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
public class WorkflowLogDto {
    private UUID id;
    private String stepName;
    private String performerName;
    private String performerRole;
    private String actionType;
    private String comments;
    private LocalDateTime timestamp;
}
