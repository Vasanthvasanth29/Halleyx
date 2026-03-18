package com.example.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDto {
    private long totalWorkflows;
    private long totalExecutions;
    private long activeUsers;
    private long pendingApprovals;
    private long completedExecutions;
}
