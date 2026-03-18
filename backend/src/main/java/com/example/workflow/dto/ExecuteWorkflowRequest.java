package com.example.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecuteWorkflowRequest {
    private UUID workflowId; // Required for specialized submission
    private Map<String, Object> inputs;
    private UUID initiatorUserId;
}
