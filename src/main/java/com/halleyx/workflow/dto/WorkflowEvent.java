package com.halleyx.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowEvent implements Serializable {
    private UUID executionId;
    private UUID stepId;
    private String eventType; // WORKFLOW_STARTED, STEP_EXECUTED, etc.
    private String data;
    private String status;
}
