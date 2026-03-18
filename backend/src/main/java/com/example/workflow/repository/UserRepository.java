package com.example.workflow.repository;

import com.example.workflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailOrUsername(String email, String username);
    java.util.List<com.example.workflow.entity.User> findByRole(com.example.workflow.entity.Role role);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
