package com.halleyx.workflow.repository;

import com.halleyx.workflow.model.ExecutionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ExecutionLogRepository extends JpaRepository<ExecutionLog, UUID> {
    List<ExecutionLog> findByExecutionIdOrderByStartedAtAsc(UUID executionId);
}
