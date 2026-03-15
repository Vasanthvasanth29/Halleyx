package com.halleyx.workflow.dto;

import com.halleyx.workflow.model.Workflow;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class WorkflowResponseDTO {
    private UUID id;
    private String name;
    private Integer version;
    private Boolean isActive;
    private Long stepCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static WorkflowResponseDTO from(Workflow workflow, Long stepCount) {
        WorkflowResponseDTO dto = new WorkflowResponseDTO();
        dto.setId(workflow.getId());
        dto.setName(workflow.getName());
        dto.setVersion(workflow.getVersion());
        dto.setIsActive(workflow.getIsActive());
        dto.setStepCount(stepCount);
        dto.setCreatedAt(workflow.getCreatedAt());
        dto.setUpdatedAt(workflow.getUpdatedAt());
        return dto;
    }
}
