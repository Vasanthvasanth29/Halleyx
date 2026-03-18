package com.example.workflow.dto;

import com.example.workflow.entity.StepType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublishWorkflowRequest {

    private List<StepDto> steps;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StepDto {
        private String tempId; // For rule mapping on frontend
        private String stepName;
        private StepType stepType;
        private String assignedRole;
        private String allowedActions;
        private Integer stepOrder;
        private List<RuleDto> rules;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RuleDto {
        private String conditionAction;
        private String nextStepTempId;
        private String conditionValue;
        private Integer priority;
    }
}
