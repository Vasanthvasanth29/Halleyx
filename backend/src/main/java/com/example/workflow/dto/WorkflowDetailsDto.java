package com.example.workflow.dto;

import com.example.workflow.entity.Workflow;
import com.example.workflow.entity.WorkflowRule;
import com.example.workflow.entity.WorkflowInputField;
import com.example.workflow.entity.WorkflowStep;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowDetailsDto {
    private Workflow workflow;
    private List<WorkflowStep> steps;
    private List<WorkflowRule> rules;
    private List<WorkflowInputField> inputFields;
}
