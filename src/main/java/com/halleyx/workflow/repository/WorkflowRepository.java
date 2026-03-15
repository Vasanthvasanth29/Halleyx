package com.halleyx.workflow.repository;

import com.halleyx.workflow.model.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface WorkflowRepository extends JpaRepository<Workflow, UUID> {
    Page<Workflow> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
