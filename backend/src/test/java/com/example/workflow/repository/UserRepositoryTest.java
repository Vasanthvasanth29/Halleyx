package com.example.workflow.repository;

import com.example.workflow.entity.Role;
import com.example.workflow.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void testSaveUser() {
        User user = User.builder()
                .username("testuser")
                .email("test@example.com")
                .password("password123")
                .role(Role.USER)
                .category("student_workflow")
                .build();

        User savedUser = userRepository.save(user);

        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getUsername()).isEqualTo("testuser");
    }

    @Test
    void testFindUserByEmail() {
        User user = User.builder()
                .username("finduser")
                .email("find@example.com")
                .password("password123")
                .role(Role.USER)
                .category("student_workflow")
                .build();

        userRepository.save(user);

        Optional<User> foundUser = userRepository.findByEmail("find@example.com");

        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getUsername()).isEqualTo("finduser");
    }
}
