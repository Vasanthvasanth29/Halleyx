package com.example.workflow.repository;

import com.example.workflow.entity.WorkflowStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkflowStepRepository extends JpaRepository<WorkflowStep, UUID> {
    List<WorkflowStep> findByWorkflowIdOrderByStepOrderAsc(UUID workflowId);

    @Modifying
    @Query("DELETE FROM WorkflowStep s WHERE s.workflow.id = :workflowId")
    void deleteByWorkflowId(@Param("workflowId") UUID workflowId);
}
