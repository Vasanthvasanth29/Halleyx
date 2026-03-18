package com.example.workflow;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.workflow.repository.*;
import com.example.workflow.entity.*;
@Component
public class TempTest implements CommandLineRunner {
    @Autowired WorkflowRepository wRepo;
    @Autowired WorkflowStepRepository sRepo;
    @Autowired WorkflowExecutionRepository eRepo;
    public void run(String... args) throws Exception {
        System.out.println("=== DIAGNOSTIC START ===");
        wRepo.findAll().forEach(w -> {
            System.out.println("Workflow: " + w.getName() + " ver " + w.getVersion() + " id: " + w.getId() + " status: " + w.getStatus());
            System.out.println("  Executions count (repo method): " + wRepo.countExecutionsByWorkflowId(w.getId()));
            System.out.println("  Executions count (actual): " + eRepo.findAll().stream().filter(e -> e.getWorkflow().getId().equals(w.getId())).count());
            sRepo.findByWorkflowIdOrderByStepOrderAsc(w.getId()).forEach(s -> {
                System.out.println("  Step: " + s.getStepName() + " id: " + s.getId());
                eRepo.findAll().stream().filter(e -> e.getCurrentStep() != null && e.getCurrentStep().getId().equals(s.getId())).forEach(e -> {
                    System.out.println("    Referenced by Execution: " + e.getId() + " under workflow: " + e.getWorkflow().getId());
                });
            });
        });
        System.out.println("=== DIAGNOSTIC END ===");
    }
}
