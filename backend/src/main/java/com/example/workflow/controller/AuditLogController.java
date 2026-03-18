package com.example.workflow.controller;

import com.example.workflow.entity.AuditLog;
import com.example.workflow.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) String username) {
        
        return ResponseEntity.ok(auditLogService.getLogs(
                category, 
                actionType, 
                username, 
                PageRequest.of(page, size, Sort.by("createdAt").descending())
        ));
    }
}
