package com.halleyx.workflow.repository;

import com.halleyx.workflow.model.Execution;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ExecutionRepository extends JpaRepository<Execution, UUID> {
    Page<Execution> findAll(Pageable pageable);
}
