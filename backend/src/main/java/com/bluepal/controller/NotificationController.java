package com.bluepal.controller;

import com.bluepal.dto.response.NotificationResponse;
import com.bluepal.entity.User;
import com.bluepal.exception.ResourceNotFoundException;
import com.bluepal.repository.UserRepository;
import com.bluepal.service.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            return auth.getName();
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        
        String username = getCurrentUsername();
        if (username == null) return ResponseEntity.status(401).build();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(notificationService.getNotifications(user, pageable));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount() {
        System.out.println("DEBUG: Received request for /api/notifications/unread-count");
        String username = getCurrentUsername();
        System.out.println("DEBUG: Current username for unread-count: " + username);
        if (username == null) return ResponseEntity.status(401).build();

        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

            long count = notificationService.getUnreadCount(user);
            System.out.println("DEBUG: Unread count for " + username + " is " + count);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            System.err.println("DEBUG ERROR in getUnreadCount:");
            e.printStackTrace();
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable("id") Long id) {
        String username = getCurrentUsername();
        if (username == null) return ResponseEntity.status(401).build();

        try {
            notificationService.markAsRead(id, username);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        String username = getCurrentUsername();
        if (username == null) return ResponseEntity.status(401).build();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        notificationService.markAllAsRead(user);
        return ResponseEntity.ok().build();
    }
}
