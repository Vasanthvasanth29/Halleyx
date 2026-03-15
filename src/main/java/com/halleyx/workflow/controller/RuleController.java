package com.halleyx.workflow.controller;

import com.halleyx.workflow.model.Rule;
import com.halleyx.workflow.repository.RuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
public class RuleController {
    private final RuleRepository ruleRepository;

    @PostMapping("/steps/{stepId}/rules")
    public ResponseEntity<Rule> addRule(@PathVariable UUID stepId, @RequestBody Rule rule) {
        rule.setStepId(stepId);
        return ResponseEntity.ok(ruleRepository.save(rule));
    }

    @GetMapping("/steps/{stepId}/rules")
    public ResponseEntity<List<Rule>> getRules(@PathVariable UUID stepId) {
        return ResponseEntity.ok(ruleRepository.findByStepIdOrderByPriorityAsc(stepId));
    }

    @PutMapping("/rules/{id}")
    public ResponseEntity<Rule> updateRule(@PathVariable UUID id, @RequestBody Rule ruleDetails) {
        return ruleRepository.findById(id).map(rule -> {
            rule.setCondition(ruleDetails.getCondition());
            rule.setNextStepId(ruleDetails.getNextStepId());
            rule.setPriority(ruleDetails.getPriority());
            return ResponseEntity.ok(ruleRepository.save(rule));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/rules/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable UUID id) {
        ruleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
