package com.example.workflow.controller;

import com.example.workflow.dto.DashboardStatsDto;
import com.example.workflow.entity.AuditLog;
import com.example.workflow.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardStatsDto> getSummary() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/category-distribution")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getCategoryDistribution() {
        return ResponseEntity.ok(dashboardService.getCategoryDistribution());
    }

    @GetMapping("/execution-history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getExecutionHistory() {
        return ResponseEntity.ok(dashboardService.getExecutionTrend());
    }

    @GetMapping("/status-distribution")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getStatusDistribution() {
        return ResponseEntity.ok(dashboardService.getStatusDistribution());
    }

    @GetMapping("/recent-activity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getRecentActivity() {
        return ResponseEntity.ok(dashboardService.getRecentActivity());
    }
}
