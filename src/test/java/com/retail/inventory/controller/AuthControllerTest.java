package com.retail.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.retail.inventory.dto.AuthResponse;
import com.retail.inventory.dto.LoginRequest;
import com.retail.inventory.dto.RegisterRequest;
import com.retail.inventory.dto.UserResponse;
import com.retail.inventory.entity.UserRole;
import com.retail.inventory.exception.InvalidCredentialsException;
import com.retail.inventory.exception.ResourceAlreadyExistsException;
import com.retail.inventory.security.JwtAuthenticationFilter;
import com.retail.inventory.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
    value = AuthController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class)
)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    private UserResponse userResponse;
    private AuthResponse authResponse;

    @BeforeEach
    void setUp() {
        userResponse = UserResponse.builder()
                .id(UUID.randomUUID())
                .name("Alex Retail")
                .email("alex@example.com")
                .role(UserRole.CUSTOMER)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        authResponse = AuthResponse.builder()
                .token("mocked_jwt_token")
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }

    @Test
    void register_ValidRequest_ReturnsCreated() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("Alex Retail")
                .email("alex@example.com")
                .password("password123")
                .role(UserRole.CUSTOMER)
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("mocked_jwt_token"))
                .andExpect(jsonPath("$.user.email").value("alex@example.com"));
    }

    @Test
    void register_DuplicateEmail_ReturnsConflict() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("Alex Retail")
                .email("alex@example.com")
                .password("password123")
                .build();

        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new ResourceAlreadyExistsException("Email is already registered: alex@example.com"));

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("Email is already registered: alex@example.com"));
    }

    @Test
    void login_ValidCredentials_ReturnsOk() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("alex@example.com")
                .password("password123")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mocked_jwt_token"))
                .andExpect(jsonPath("$.user.email").value("alex@example.com"));
    }

    @Test
    void login_InvalidCredentials_ReturnsUnauthorized() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("alex@example.com")
                .password("wrongpassword")
                .build();

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new InvalidCredentialsException("Invalid email or password"));

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    @WithMockUser(username = "alex@example.com")
    void getCurrentUser_Authenticated_ReturnsOk() throws Exception {
        when(authService.getCurrentUser("alex@example.com")).thenReturn(userResponse);

        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("alex@example.com"))
                .andExpect(jsonPath("$.name").value("Alex Retail"));
    }

    @Test
    void logout_ReturnsOk() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"));
    }
}
