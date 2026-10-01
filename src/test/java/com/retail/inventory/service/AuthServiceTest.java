package com.retail.inventory.service;

import com.retail.inventory.dto.AuthResponse;
import com.retail.inventory.dto.LoginRequest;
import com.retail.inventory.dto.RegisterRequest;
import com.retail.inventory.dto.UserResponse;
import com.retail.inventory.entity.User;
import com.retail.inventory.entity.UserRole;
import com.retail.inventory.exception.InvalidCredentialsException;
import com.retail.inventory.exception.ResourceAlreadyExistsException;
import com.retail.inventory.exception.ResourceNotFoundException;
import com.retail.inventory.repository.UserRepository;
import com.retail.inventory.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private UUID userId;
    private User sampleUser;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        sampleUser = User.builder()
                .id(userId)
                .name("Alex Retail")
                .email("alex@example.com")
                .passwordHash("hashed_password_123")
                .role(UserRole.CUSTOMER)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void register_Success() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Alex Retail")
                .email("alex@example.com")
                .password("password123")
                .role(UserRole.CUSTOMER)
                .build();

        when(userRepository.existsByEmail("alex@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed_password_123");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtTokenProvider.generateToken(any(User.class))).thenReturn("jwt_mock_token");

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("jwt_mock_token");
        assertThat(response.getUser().getEmail()).isEqualTo("alex@example.com");
        assertThat(response.getUser().getName()).isEqualTo("Alex Retail");
        assertThat(response.getUser().getRole()).isEqualTo(UserRole.CUSTOMER);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_DuplicateEmail_ThrowsException() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Alex Retail")
                .email("alex@example.com")
                .password("password123")
                .build();

        when(userRepository.existsByEmail("alex@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessageContaining("Email is already registered");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        LoginRequest request = LoginRequest.builder()
                .email("alex@example.com")
                .password("password123")
                .build();

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("password123", "hashed_password_123")).thenReturn(true);
        when(jwtTokenProvider.generateToken(sampleUser)).thenReturn("jwt_mock_token");

        AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("jwt_mock_token");
        assertThat(response.getUser().getEmail()).isEqualTo("alex@example.com");
    }

    @Test
    void login_UnknownEmail_ThrowsException() {
        LoginRequest request = LoginRequest.builder()
                .email("unknown@example.com")
                .password("password123")
                .build();

        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void login_IncorrectPassword_ThrowsException() {
        LoginRequest request = LoginRequest.builder()
                .email("alex@example.com")
                .password("wrongpassword")
                .build();

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongpassword", "hashed_password_123")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void getCurrentUser_Success() {
        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(sampleUser));

        UserResponse response = authService.getCurrentUser("alex@example.com");

        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo("alex@example.com");
        assertThat(response.getRole()).isEqualTo(UserRole.CUSTOMER);
    }

    @Test
    void getCurrentUser_NotFound_ThrowsException() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.getCurrentUser("missing@example.com"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found with email");
    }
}
