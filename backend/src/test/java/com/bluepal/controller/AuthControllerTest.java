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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import java.util.Optional;
import java.util.List;
import com.bluepal.security.CustomUserDetails;
import com.bluepal.entity.User;
import com.bluepal.entity.PasswordResetToken;
import com.bluepal.dto.request.ForgotPasswordRequest;
import com.bluepal.dto.request.ResetPasswordRequest;
import org.springframework.security.core.Authentication;

@WebMvcTest(controllers = AuthController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

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

    @Test
    void loginUser_Success() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password");

        Authentication auth = mock(Authentication.class);
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        User userRecord = User.builder().id(123L).username("testuser").email("test@ex.com").build();

        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(auth.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn(123L);
        when(userDetails.getUsername()).thenReturn("testuser");
        when(userDetails.getEmail()).thenReturn("test@ex.com");
        when(userDetails.getAuthorities()).thenReturn(List.of());
        when(jwtUtils.generateJwtToken(auth)).thenReturn("mock.jwt.token");
        when(userRepository.findById(123L)).thenReturn(Optional.of(userRecord));

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock.jwt.token"))
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    void loginUser_Locked() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("locked");
        request.setPassword("password");

        when(authenticationManager.authenticate(any()))
            .thenThrow(new org.springframework.security.authentication.LockedException("Locked"));

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(content().string("your account is restricted by admin"));
    }

    @Test
    void forgotPassword_Success() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("user@example.com");
        User userRecord = User.builder().id(1L).email("user@example.com").build();

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(userRecord));
        when(passwordResetTokenRepository.findByUser(userRecord)).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/forgot-password")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
        
        verify(emailService).sendResetPasswordEmail(eq("user@example.com"), anyString());
    }

    @Test
    void resetPassword_Success() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("123456");
        request.setNewPassword("NewPass@123");
        
        User userRecord = User.builder().id(1L).build();
        PasswordResetToken token = PasswordResetToken.builder()
                .token("123456")
                .user(userRecord)
                .expiryDate(java.time.LocalDateTime.now().plusHours(1))
                .build();

        when(passwordResetTokenRepository.findByToken("123456")).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("NewPass@123")).thenReturn("encodedNewPass");

        mockMvc.perform(post("/api/auth/reset-password")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Password reset successful!"));
        
        verify(userRepository).save(userRecord);
        assertEquals("encodedNewPass", userRecord.getPassword());
    }
}
