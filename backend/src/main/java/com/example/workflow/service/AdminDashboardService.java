package com.example.workflow.service;

import com.example.workflow.dto.DashboardStatsDto;
import com.example.workflow.entity.AuditLog;
import com.example.workflow.entity.ExecutionStatus;
import com.example.workflow.repository.AuditLogRepository;
import com.example.workflow.repository.UserRepository;
import com.example.workflow.repository.WorkflowExecutionRepository;
import com.example.workflow.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final WorkflowRepository workflowRepository;
    private final WorkflowExecutionRepository executionRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public DashboardStatsDto getStats() {
        return DashboardStatsDto.builder()
                .totalWorkflows(workflowRepository.count())
                .totalExecutions(executionRepository.count())
                .activeUsers(userRepository.count())
                .completedExecutions(executionRepository.countByStatus(ExecutionStatus.COMPLETED))
                .pendingApprovals(executionRepository.countByStatus(ExecutionStatus.PENDING) + 
                                  executionRepository.countByStatus(ExecutionStatus.IN_PROGRESS))
                .build();
    }

    public List<Map<String, Object>> getCategoryDistribution() {
        // User requested: "workflows table grouped by category"
        List<Object[]> results = workflowRepository.countWorkflowsByCategory();
        List<Map<String, Object>> data = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", row[0].toString().replace("_", " ").toUpperCase());
            map.put("value", row[1]);
            data.add(map);
        }
        return data;
    }

    public List<Map<String, Object>> getStatusDistribution() {
        List<Object[]> results = executionRepository.countExecutionsByStatus();
        List<Map<String, Object>> data = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", row[0].toString());
            map.put("value", row[1]);
            data.add(map);
        }
        return data;
    }

    public List<Map<String, Object>> getExecutionTrend() {
        List<Object[]> results = executionRepository.countExecutionsByDate();
        List<Map<String, Object>> data = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("date", row[0].toString());
            map.put("executions", row[1]);
            data.add(map);
        }
        return data;
    }

    public List<AuditLog> getRecentActivity() {
        // Fetch latest 10 logs
        return auditLogRepository.findAll(
                org.springframework.data.domain.PageRequest.of(0, 10, org.springframework.data.domain.Sort.by("createdAt").descending())
        ).getContent();
    }
}
