package com.example.workflow.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class WorkflowUserMappingRequest {
    private String workflowCategory;

    private String level1Role;
    private UUID level1UserId;

    private String level2Role;
    private UUID level2UserId;

    private String level3Role;
    private UUID level3UserId;

    private String level4Role;
    private UUID level4UserId;
}
