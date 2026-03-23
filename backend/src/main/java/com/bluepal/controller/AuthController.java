package com.bluepal.controller;

import com.bluepal.dto.request.LoginRequest;
import com.bluepal.dto.request.RegisterRequest;
import com.bluepal.dto.response.JwtResponse;
import com.bluepal.entity.User;
import com.bluepal.repository.UserRepository;
import com.bluepal.security.CustomUserDetails;
import com.bluepal.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import com.bluepal.dto.request.ForgotPasswordRequest;
import com.bluepal.dto.request.ResetPasswordRequest;
import com.bluepal.entity.PasswordResetToken;
import com.bluepal.entity.VerificationToken;
import com.bluepal.repository.PasswordResetTokenRepository;
import com.bluepal.repository.VerificationTokenRepository;
import com.bluepal.service.impl.EmailServiceImpl;

import java.time.LocalDateTime;
import java.security.SecureRandom;
import java.util.UUID;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

        private final AuthenticationManager authenticationManager;
        private final UserRepository userRepository;
        private final PasswordEncoder encoder;
        private final JwtUtils jwtUtils;
        private final PasswordResetTokenRepository passwordResetTokenRepository;
        private final VerificationTokenRepository verificationTokenRepository;
        private final EmailServiceImpl emailService;

        public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository,
                        PasswordEncoder encoder, JwtUtils jwtUtils,
                        PasswordResetTokenRepository passwordResetTokenRepository,
                        VerificationTokenRepository verificationTokenRepository,
                        EmailServiceImpl emailService) {
                this.authenticationManager = authenticationManager;
                this.userRepository = userRepository;
                this.encoder = encoder;
                this.jwtUtils = jwtUtils;
                this.passwordResetTokenRepository = passwordResetTokenRepository;
                this.verificationTokenRepository = verificationTokenRepository;
                this.emailService = emailService;
        }

        @PostMapping("/login")
        public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                                                loginRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

                String jwt = jwtUtils.generateJwtToken(authentication);

                List<String> roles = userDetails.getAuthorities().stream()
                                .map(GrantedAuthority::getAuthority)
                                .collect(Collectors.toList());

                return ResponseEntity.ok(new JwtResponse(jwt,
                                userDetails.getId(),
                                userDetails.getUsername(),
                                userDetails.getEmail(),
                                roles));
        }

        @PostMapping("/register")
        @Transactional
        public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
                try {
                        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
                                return ResponseEntity
                                                .badRequest()
                                                .body("Error: Username is already taken!");
                        }

                        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                                return ResponseEntity
                                                .badRequest()
                                                .body("Error: Email is already in use!");
                        }

                        // Create new user's account
                        User user = User.builder()
                                        .username(signUpRequest.getUsername())
                                        .email(signUpRequest.getEmail())
                                        .password(encoder.encode(signUpRequest.getPassword()))
                                        .enabled(true)
                                        .build();

                        userRepository.save(user);

                        return ResponseEntity.ok("Registration successful! You can now log in.");
                } catch (Exception e) {
                        System.err.println("Registration failed: " + e.getMessage());
                        e.printStackTrace();
                        return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
                }
        }

        @GetMapping("/verify-registration")
        @Transactional
        public ResponseEntity<?> verifyRegistration(@RequestParam("token") String token) {
                Optional<VerificationToken> tokenOpt = verificationTokenRepository.findByToken(token);
                
                if (tokenOpt.isEmpty()) {
                        return ResponseEntity.badRequest().body("Error: Invalid verification token!");
                }

                VerificationToken verificationToken = tokenOpt.get();
                if (verificationToken.isExpired()) {
                        verificationTokenRepository.delete(verificationToken);
                        return ResponseEntity.badRequest().body("Error: Verification token has expired!");
                }

                User user = verificationToken.getUser();
                user.setEnabled(true);
                userRepository.save(user);

                verificationTokenRepository.delete(verificationToken);

                return ResponseEntity.ok("Account verified successfully! You can now log in.");
        }

        @PostMapping("/change-password")
        public ResponseEntity<?> changePassword(
                        @RequestBody java.util.Map<String, String> body,
                        org.springframework.security.core.Authentication auth) {
                if (auth == null || !auth.isAuthenticated()) {
                        return ResponseEntity.status(401).body("Unauthorized");
                }
                String username = auth.getName();
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new com.bluepal.exception.ResourceNotFoundException("User",
                                                "username", username));

                String currentPassword = body.get("currentPassword");
                String newPassword = body.get("newPassword");

                if (!encoder.matches(currentPassword, user.getPassword())) {
                        return ResponseEntity.badRequest().body("Current password is incorrect");
                }
                if (newPassword == null || newPassword.length() < 6) {
                        return ResponseEntity.badRequest().body("New password must be at least 6 characters");
                }

                user.setPassword(encoder.encode(newPassword));
                userRepository.save(user);
                return ResponseEntity.ok("Password changed successfully");
        }

        @org.springframework.web.bind.annotation.DeleteMapping("/users/me")
        public ResponseEntity<?> deleteAccount(org.springframework.security.core.Authentication auth) {
                if (auth == null || !auth.isAuthenticated()) {
                        return ResponseEntity.status(401).body("Unauthorized");
                }
                String username = auth.getName();
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new com.bluepal.exception.ResourceNotFoundException("User",
                                                "username", username));
                userRepository.delete(user);
                return ResponseEntity.ok("Account deleted successfully");
        }

        @PostMapping("/forgot-password")
        @Transactional
        public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
                Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
                if (userOpt.isEmpty()) {
                        return ResponseEntity.badRequest().body("Error: User with this email not found!");
                }
                User user = userOpt.get();

                // Delete any existing token for this user
                passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);

                String token = String.format("%06d", new SecureRandom().nextInt(1000000));
                PasswordResetToken resetToken = PasswordResetToken.builder()
                                .token(token)
                                .user(user)
                                .expiryDate(LocalDateTime.now().plusHours(24))
                                .build();

                passwordResetTokenRepository.save(resetToken);
                emailService.sendResetPasswordEmail(user.getEmail(), token);

                return ResponseEntity.ok("Password reset email sent!");
        }

        @PostMapping("/reset-password")
        @Transactional
        public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
                PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

                if (resetToken.isExpired()) {
                        passwordResetTokenRepository.delete(resetToken);
                        return ResponseEntity.badRequest().body("Token has expired");
                }

                User user = resetToken.getUser();
                user.setPassword(encoder.encode(request.getNewPassword()));
                userRepository.save(user);

                passwordResetTokenRepository.delete(resetToken);

                return ResponseEntity.ok("Password reset successful!");
        }
}
