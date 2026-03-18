package com.example.workflow.repository;

import com.example.workflow.entity.WorkflowUserMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkflowUserMappingRepository extends JpaRepository<WorkflowUserMapping, UUID> {
    Optional<WorkflowUserMapping> findByWorkflowCategoryIgnoreCase(String category);
    boolean existsByWorkflowCategoryIgnoreCase(String category);
}
