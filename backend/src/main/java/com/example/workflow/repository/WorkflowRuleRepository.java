package com.example.workflow.repository;

import com.example.workflow.entity.WorkflowRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkflowRuleRepository extends JpaRepository<WorkflowRule, UUID> {
    List<WorkflowRule> findByWorkflowId(UUID workflowId);

    @Modifying
    @Query("DELETE FROM WorkflowRule r WHERE r.workflow.id = :workflowId")
    void deleteByWorkflowId(@Param("workflowId") UUID workflowId);

    List<WorkflowRule> findByStepIdOrderByPriorityAsc(UUID stepId);
    Optional<WorkflowRule> findByStepIdAndConditionAndConditionValue(UUID stepId, String condition, String conditionValue);
    Optional<WorkflowRule> findByStepIdAndIsDefaultTrue(UUID stepId);

    @Query("SELECT COALESCE(MAX(r.priority), 0) FROM WorkflowRule r WHERE r.step.id = :stepId")
    Integer findMaxPriorityByStepId(@Param("stepId") UUID stepId);
}
