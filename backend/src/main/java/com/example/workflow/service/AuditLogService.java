package com.example.workflow.service;

import com.example.workflow.entity.AuditLog;
import com.example.workflow.entity.User;
import com.example.workflow.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void logEvent(String actionType, String workflowCategory, String workflowName, 
                         User user, String description, UUID executionId, String status) {
        
        AuditLog log = AuditLog.builder()
                .actionType(actionType)
                .workflowCategory(workflowCategory)
                .workflowName(workflowName)
                .performedByUserId(user != null ? user.getId() : null)
                .performerName(user != null ? user.getUsername() : "SYSTEM")
                .performedByRole(user != null ? user.getRole().name() : "SYSTEM")
                .actionDescription(description)
                .executionId(executionId)
                .status(status)
                .build();
        
        auditLogRepository.save(log);
    }

    public Page<AuditLog> getLogs(String category, String actionType, String username, Pageable pageable) {
        Specification<AuditLog> spec = Specification.where(null);

        if (category != null && !category.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("workflowCategory"), category));
        }
        if (actionType != null && !actionType.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("actionType"), actionType));
        }
        if (username != null && !username.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("performerName")), "%" + username.toLowerCase() + "%"));
        }

        return auditLogRepository.findAll(spec, pageable);
    }
}
