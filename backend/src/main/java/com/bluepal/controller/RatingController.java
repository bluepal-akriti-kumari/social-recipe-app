package com.bluepal.controller;

import com.bluepal.entity.User;
import com.bluepal.exception.ResourceNotFoundException;
import com.bluepal.repository.UserRepository;
import com.bluepal.service.interfaces.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/api/recipes/{id}/rating")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;
    private final UserRepository userRepository;

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            return auth.getName();
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<?> rateRecipe(@PathVariable("id") Long id, @RequestBody Map<String, Integer> body) {
        String username = getCurrentUsername();
        if (username == null) return ResponseEntity.status(401).build();

        Integer rating = body.get("rating");
        if (rating == null) return ResponseEntity.badRequest().body("Rating is required");

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        ratingService.rateRecipe(user, id, rating);
        return ResponseEntity.ok().build();
    }
}
