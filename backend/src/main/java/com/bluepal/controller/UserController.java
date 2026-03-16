package com.bluepal.controller;

import com.bluepal.dto.response.UserProfileResponse;
import com.bluepal.service.interfaces.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !authentication.getPrincipal().equals("anonymousUser")) {
            return authentication.getName();
        }
        return null;
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable("username") String username) {
        String currentUsername = getCurrentUsername();
        UserProfileResponse response = userService.getUserProfile(username, currentUsername);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/{username}/follow")
    public ResponseEntity<?> followUser(@PathVariable("username") String username) {
        String currentUsername = getCurrentUsername();
        if (currentUsername == null) {
            return ResponseEntity.status(401).body("Authentication required");
        }
        
        // Updated to use toggleFollow
        userService.toggleFollow(currentUsername, username);
        return ResponseEntity.ok("Follow status updated for " + username);
    }
    
    

    @DeleteMapping("/{username}/unfollow")
    public ResponseEntity<?> unfollowUser(@PathVariable("username") String username) {
        String currentUsername = getCurrentUsername();
        if (currentUsername == null) {
            return ResponseEntity.status(401).body("Authentication required");
        }
        
        userService.unfollowUser(currentUsername, username);
        return ResponseEntity.ok("Successfully unfollowed user " + username);
    }
}
