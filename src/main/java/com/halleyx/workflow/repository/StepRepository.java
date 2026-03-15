package com.halleyx.workflow.repository;

import com.halleyx.workflow.model.WorkflowStep;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StepRepository extends JpaRepository<WorkflowStep, UUID> {
    List<WorkflowStep> findByWorkflowIdOrderByOrderAsc(UUID workflowId);
}
