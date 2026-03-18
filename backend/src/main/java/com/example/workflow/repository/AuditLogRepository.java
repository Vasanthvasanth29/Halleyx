package com.example.workflow.repository;

import com.example.workflow.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID>, JpaSpecificationExecutor<AuditLog> {
    
    Page<AuditLog> findByWorkflowCategory(String category, Pageable pageable);
    
    Page<AuditLog> findByPerformedByUserId(UUID userId, Pageable pageable);
    
    Page<AuditLog> findByActionType(String actionType, Pageable pageable);
}
