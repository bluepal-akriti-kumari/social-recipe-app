package com.bluepal.controller;

import com.bluepal.entity.User;
import com.bluepal.repository.UserRepository;
import com.bluepal.exception.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final com.bluepal.service.impl.ModerationService moderationService;

    public AdminController(UserRepository userRepository, com.bluepal.service.impl.ModerationService moderationService) {
        this.userRepository = userRepository;
        this.moderationService = moderationService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PatchMapping("/users/{username}/roles")
    public ResponseEntity<?> updateUserRoles(@PathVariable String username, @RequestBody Map<String, List<String>> body) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        
        List<String> newRoles = body.get("roles");
        if (newRoles != null) {
            user.getRoles().clear();
            user.getRoles().addAll(newRoles);
            userRepository.save(user);
        }
        return ResponseEntity.ok("User roles updated successfully");
    }

    @PatchMapping("/users/{username}/verify")
    public ResponseEntity<?> toggleUserVerification(@PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        
        user.setVerified(!user.isVerified());
        userRepository.save(user);
        return ResponseEntity.ok("User verification toggled: " + user.isVerified());
    }

    @GetMapping("/reports")
    public ResponseEntity<List<com.bluepal.entity.Report>> getPendingReports() {
        return ResponseEntity.ok(moderationService.getPendingReports());
    }

    @PatchMapping("/reports/{id}/resolve")
    public ResponseEntity<?> resolveReport(@PathVariable Long id) {
        moderationService.resolveReport(id);
        return ResponseEntity.ok("Report resolved");
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getPlatformStats() {
        long userCount = userRepository.count();
        // Since we don't have a RecipeRepository here, we'll just return userCount for now
        // or inject it. Let's keep it simple.
        return ResponseEntity.ok(Map.of("totalUsers", userCount));
    }
}
