package com.bluepal.controller;

import com.bluepal.dto.request.LoginRequest;
import com.bluepal.dto.request.RegisterRequest;
import com.bluepal.repository.PasswordResetTokenRepository;
import com.bluepal.repository.UserRepository;
import com.bluepal.security.JwtUtils;
import com.bluepal.security.CustomUserDetailsService;
import com.bluepal.service.impl.EmailServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private com.bluepal.repository.UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private com.bluepal.repository.PasswordResetTokenRepository passwordResetTokenRepository;

    @MockBean
    private com.bluepal.repository.VerificationTokenRepository verificationTokenRepository;

    @MockBean
    private EmailServiceImpl emailService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerUser_Success() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("new@example.com");
        request.setPassword("Password@123");
        request.setFullName("New User");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(userRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Registration successful! You can now log in."));
    }

    @Test
    void registerUser_UsernameTaken() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("takenuser");
        request.setEmail("new@example.com");
        request.setPassword("Password@123");
        request.setFullName("Taken User");

        when(userRepository.existsByUsername("takenuser")).thenReturn(true);

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Error: Username is already taken!"));
    }

    @Test
    void loginUser_InvalidRequest() throws Exception {
        LoginRequest request = new LoginRequest();
        // Missing username/password

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
