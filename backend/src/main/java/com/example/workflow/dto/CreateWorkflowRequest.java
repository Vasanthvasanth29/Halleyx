package com.example.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateWorkflowRequest {
    private String name;
    private String description;
    private String category;
    private String status;
    private Integer version;
    private java.util.List<InputFieldDto> inputFields;

    @Data
    public static class InputFieldDto {
        private String fieldName;
        private String fieldType;
        private boolean required;
        private String allowedValues;
    }
}
