package com.example.workflow.repository;

import com.example.workflow.entity.WorkflowInputField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkflowInputFieldRepository extends JpaRepository<WorkflowInputField, UUID> {
    List<WorkflowInputField> findByWorkflowId(UUID workflowId);

    @Modifying
    @Query("DELETE FROM WorkflowInputField i WHERE i.workflow.id = :workflowId")
    void deleteByWorkflowId(@Param("workflowId") UUID workflowId);
}
