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
    private final com.bluepal.service.interfaces.RecipeService recipeService;

    public AdminController(UserRepository userRepository, 
                           com.bluepal.service.impl.ModerationService moderationService,
                           com.bluepal.service.interfaces.RecipeService recipeService,
                           com.bluepal.repository.RecipeRepository recipeRepository) {
        this.userRepository = userRepository;
        this.moderationService = moderationService;
        this.recipeService = recipeService;
        this.recipeRepository = recipeRepository;
    }

    private final com.bluepal.repository.RecipeRepository recipeRepository;

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

    @PatchMapping("/recipes/{id}/premium")
    public ResponseEntity<?> toggleRecipePremium(@PathVariable Long id) {
        com.bluepal.entity.Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));
        recipe.setPremium(!recipe.isPremium());
        recipeRepository.save(recipe);
        return ResponseEntity.ok("Recipe premium status toggled to: " + recipe.isPremium());
    }

    @GetMapping("/recipes")
    public ResponseEntity<java.util.List<com.bluepal.entity.Recipe>> getAllRecipes() {
        return ResponseEntity.ok(recipeRepository.findAll());
    }

    @PatchMapping("/recipes/{id}/status")
    public ResponseEntity<?> toggleRecipeStatus(@PathVariable Long id) {
        com.bluepal.entity.Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));
        
        if (recipe.getStatus() == com.bluepal.entity.RecipeStatus.ACTIVE) {
            recipe.setStatus(com.bluepal.entity.RecipeStatus.RESTRICTED);
        } else {
            recipe.setStatus(com.bluepal.entity.RecipeStatus.ACTIVE);
        }
        recipeRepository.save(recipe);
        return ResponseEntity.ok("Recipe status updated to: " + recipe.getStatus());
    }

    @DeleteMapping("/recipes/{id}")
    public ResponseEntity<?> deleteRecipe(@PathVariable Long id) {
        recipeService.deleteRecipe(id, "admin"); // Assuming admin can delete any recipe
        return ResponseEntity.ok("Recipe deleted successfully");
    }

    @PatchMapping("/users/{username}/restrict")
    public ResponseEntity<?> toggleUserRestriction(@PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        
        user.setRestricted(!user.isRestricted());
        userRepository.save(user);
        return ResponseEntity.ok("User restricted status toggled: " + user.isRestricted());
    }
}
