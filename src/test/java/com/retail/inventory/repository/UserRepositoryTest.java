package com.retail.inventory.repository;

import com.retail.inventory.entity.User;
import com.retail.inventory.entity.UserRole;
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
    void saveAndFindByEmail_Success() {
        User user = User.builder()
                .name("Jane Manager")
                .email("jane@retail.com")
                .passwordHash("hashed_secret_password")
                .role(UserRole.ADMIN)
                .active(true)
                .build();

        userRepository.save(user);

        Optional<User> found = userRepository.findByEmail("jane@retail.com");
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Jane Manager");
        assertThat(found.get().getRole()).isEqualTo(UserRole.ADMIN);
        assertThat(userRepository.existsByEmail("jane@retail.com")).isTrue();
        assertThat(userRepository.existsByEmail("nonexistent@retail.com")).isFalse();
    }
}
