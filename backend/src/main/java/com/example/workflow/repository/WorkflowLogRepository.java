package com.example.workflow.repository;

import com.example.workflow.entity.WorkflowLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkflowLogRepository extends JpaRepository<WorkflowLog, UUID> {
    List<WorkflowLog> findByExecutionIdOrderByTimestampAsc(UUID executionId);

    @Modifying
    @Query("DELETE FROM WorkflowLog l WHERE l.execution.id IN (SELECT e.id FROM WorkflowExecution e WHERE e.workflow.id = :workflowId)")
    void deleteByWorkflowId(@Param("workflowId") UUID workflowId);
}
