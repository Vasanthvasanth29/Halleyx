package com.example.workflow.config;

import com.example.workflow.entity.Role;
import com.example.workflow.entity.User;
import com.example.workflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class AdminBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.example.workflow.repository.WorkflowUserMappingRepository mappingRepository;
    private final com.example.workflow.service.WorkflowManagementService workflowService;

    @Override
    public void run(String... args) {
        try {
            System.out.println("BOOTSTRAP: Starting initialization...");
            // 1. Seed Roles/Users
            seedUser("system_admin", "admin@halleyx.com", Role.ADMIN, "GENERAL");
            User employee = seedUser("employee", "employee@halleyx.com", Role.EMPLOYEE, "expense_workflow");
            User manager = seedUser("manager", "manager@halleyx.com", Role.MANAGER, "expense_workflow");
            User finance = seedUser("finance", "finance@halleyx.com", Role.FINANCE, "expense_workflow");
            User ceo = seedUser("ceo", "ceo@halleyx.com", Role.CEO, "expense_workflow");
            User hr = seedUser("hr", "hr@halleyx.com", Role.HR, "GENERAL");
            
            // 2. Seed Student/Employee Dummy Users if needed
            User student = seedUser("student", "student@halleyx.com", Role.STUDENT, "student_workflow");
            User advisor = seedUser("advisor", "advisor@halleyx.com", Role.ADVISOR, "student_workflow");

            // 3. Seed Workflow Mappings
            seedMapping("EXPENSE_WORKFLOW", employee, manager, finance, ceo);
            seedMapping("STUDENT_WORKFLOW", student, advisor, null, null);

            // 4. Seed Default Workflows if missing
            boolean hasExpense = workflowService.getAllWorkflows().stream()
                    .anyMatch(w -> "EXPENSE_WORKFLOW".equalsIgnoreCase(w.getCategory()) && w.getStatus() == com.example.workflow.entity.WorkflowStatus.ACTIVE);
            
            if (!hasExpense) {
                System.out.println("BOOTSTRAP-DEBUG: Seeding default Expense Workflow...");
                com.example.workflow.dto.CreateWorkflowRequest req = new com.example.workflow.dto.CreateWorkflowRequest();
                req.setName("Standard Expense Report");
                req.setDescription("Default seeded expense workflow");
                req.setCategory("EXPENSE_WORKFLOW");
                req.setStatus("ACTIVE");
                workflowService.createWorkflow(req);
            }



            boolean hasStudent = workflowService.getAllWorkflows().stream()
                    .anyMatch(w -> "STUDENT_WORKFLOW".equalsIgnoreCase(w.getCategory()) && w.getStatus() == com.example.workflow.entity.WorkflowStatus.ACTIVE);
            
            if (!hasStudent) {
                System.out.println("BOOTSTRAP-DEBUG: Seeding default Student Workflow...");
                com.example.workflow.dto.CreateWorkflowRequest stuReq = new com.example.workflow.dto.CreateWorkflowRequest();
                stuReq.setName("Student Registration Form");
                stuReq.setDescription("Default seeded student workflow");
                stuReq.setCategory("STUDENT_WORKFLOW");
                stuReq.setStatus("ACTIVE");
                workflowService.createWorkflow(stuReq);
            }

            System.out.println("BOOTSTRAP: All standard users, mappings, and workflows ready.");
        } catch (Exception e) {
            System.err.println("CRITICAL BOOTSTRAP FAILURE: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private User seedUser(String username, String email, Role role, String category) {
        User user = userRepository.findByUsername(username).orElseGet(() -> User.builder().username(username).build());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("password123")); // Default password for seeding
        user.setRole(role);
        user.setCategory(category);
        return userRepository.save(user);
    }

    private void seedMapping(String category, User u1, User u2, User u3, User u4) {
        System.out.println("BOOTSTRAP-DEBUG: Seeding mapping for category: " + category);
        com.example.workflow.entity.WorkflowUserMapping mapping = mappingRepository.findByWorkflowCategoryIgnoreCase(category)
                .orElse(com.example.workflow.entity.WorkflowUserMapping.builder().workflowCategory(category.toUpperCase()).build());
        
        mapping.setLevel1User(u1); mapping.setLevel1Role(u1.getRole().name());
        mapping.setLevel2User(u2); mapping.setLevel2Role(u2.getRole().name());
        if (u3 != null) { mapping.setLevel3User(u3); mapping.setLevel3Role(u3.getRole().name()); }
        if (u4 != null) { mapping.setLevel4User(u4); mapping.setLevel4Role(u4.getRole().name()); }
        
        com.example.workflow.entity.WorkflowUserMapping saved = mappingRepository.save(mapping);
        System.out.println("BOOTSTRAP-DEBUG: Mapping saved for " + category + " with ID: " + saved.getId());
    }
}
