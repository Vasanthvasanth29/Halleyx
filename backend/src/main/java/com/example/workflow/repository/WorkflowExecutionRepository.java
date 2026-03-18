package com.example.workflow.repository;

import com.example.workflow.entity.ExecutionStatus;
import com.example.workflow.entity.WorkflowExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkflowExecutionRepository extends JpaRepository<WorkflowExecution, UUID> {
    List<WorkflowExecution> findByWorkflowId(UUID workflowId);

    @Modifying
    @Query("DELETE FROM WorkflowExecution e WHERE e.workflow.id = :workflowId")
    void deleteByWorkflowId(@Param("workflowId") UUID workflowId);

    List<WorkflowExecution> findByInitiatorUserId(UUID initiatorUserId);
    List<WorkflowExecution> findByCurrentHandlerUserId(UUID currentHandlerUserId);
    List<WorkflowExecution> findByCurrentStepAssignedRoleIgnoreCase(String assignedRole);
    
    long countByStatus(ExecutionStatus status);

    @Query("SELECT e.workflow.category, COUNT(e) FROM WorkflowExecution e GROUP BY e.workflow.category")
    List<Object[]> countExecutionsByCategory();

    @Query("SELECT e.status, COUNT(e) FROM WorkflowExecution e GROUP BY e.status")
    List<Object[]> countExecutionsByStatus();

    @Query(value = "SELECT CAST(started_at AS DATE) as execution_date, COUNT(*) FROM proc_workflow_executions GROUP BY CAST(started_at AS DATE)", nativeQuery = true)
    List<Object[]> countExecutionsByDate();
}
