package com.example.workflow.repository;

import com.example.workflow.entity.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, UUID> {
    List<Workflow> findByCategory(String category);
    List<Workflow> findByCategoryIgnoreCase(String category);

    @org.springframework.data.jpa.repository.Query("SELECT w.category, COUNT(w) FROM Workflow w GROUP BY w.category")
    List<Object[]> countWorkflowsByCategory();

    // Enhanced search for management page
    @org.springframework.data.jpa.repository.Query("SELECT w FROM Workflow w WHERE " +
            "(:name IS NULL OR LOWER(w.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:category IS NULL OR w.category = :category)")
    org.springframework.data.domain.Page<Workflow> searchWorkflows(String name, String category, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(s) FROM WorkflowStep s WHERE s.workflow.id = :workflowId")
    long countStepsByWorkflowId(java.util.UUID workflowId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(e) FROM WorkflowExecution e WHERE e.workflow.id = :workflowId")
    long countExecutionsByWorkflowId(java.util.UUID workflowId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(e) FROM WorkflowExecution e WHERE e.currentStep.workflow.id = :workflowId")
    long countExecutionsUsingWorkflowSteps(java.util.UUID workflowId);
}
