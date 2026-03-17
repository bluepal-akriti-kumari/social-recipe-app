package com.bluepal.controller;

import com.bluepal.dto.request.RecipeRequest;
import com.bluepal.dto.response.RecipeResponse;
import com.bluepal.service.interfaces.CloudinaryService;
import com.bluepal.service.interfaces.RecipeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class RecipeController {

    private final RecipeService recipeService;
    private final CloudinaryService cloudinaryService;

    public RecipeController(RecipeService recipeService, CloudinaryService cloudinaryService) {
        this.recipeService = recipeService;
        this.cloudinaryService = cloudinaryService;
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            return auth.getName();
        }
        return null;
    }

    // ─── Explore Feed (Updated to Cursor-based) ────────────────────────────────
    @GetMapping("/feed/explore")
    public ResponseEntity<Map<String, Object>> getExploreFeed(
            @RequestParam(name = "cursor", required = false) String cursorStr,
            @RequestParam(name = "size", defaultValue = "12") int size,
            @RequestParam(name = "category", required = false) String category) {
        
        LocalDateTime cursor = (cursorStr != null && !cursorStr.isEmpty()) 
                ? LocalDateTime.parse(cursorStr) 
                : null;

        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(recipeService.getExploreFeedCursorByCategory(category, cursor, size, getCurrentUsername()));
        }
        return ResponseEntity.ok(recipeService.getExploreFeedCursor(cursor, size, getCurrentUsername()));
    }

    @GetMapping("/recipes/trending")
    public ResponseEntity<List<RecipeResponse>> getTrendingRecipes(
            @RequestParam(name = "limit", defaultValue = "10") int limit) {
        return ResponseEntity.ok(recipeService.getTrendingRecipes(getCurrentUsername(), limit));
    }

    @GetMapping("/recipes/category/{category}")
    public ResponseEntity<List<RecipeResponse>> getRecipesByCategory(
            @PathVariable("category") String category,
            @RequestParam(name = "limit", defaultValue = "10") int limit) {
        return ResponseEntity.ok(recipeService.getRecipesByCategory(category, getCurrentUsername(), limit));
    }

    // ─── Personalized Feed (Updated to Cursor-based) ───────────────────────────
    @GetMapping("/feed/personalized")
    public ResponseEntity<Map<String, Object>> getPersonalizedFeed(
            @RequestParam(name = "cursor", required = false) String cursorStr,
            @RequestParam(name = "size", defaultValue = "12") int size) {
        
        LocalDateTime cursor = (cursorStr != null && !cursorStr.isEmpty()) 
                ? LocalDateTime.parse(cursorStr) 
                : null;

        return ResponseEntity.ok(recipeService.getPersonalizedFeedCursor(getCurrentUsername(), cursor, size));
    }

    // ─── Search (Updated to Full-Text) ─────────────────────────────────────────
    @GetMapping("/recipes/search")
    public ResponseEntity<List<RecipeResponse>> searchRecipes(
            @RequestParam(name = "q") String q) {
        return ResponseEntity.ok(recipeService.searchRecipesFullText(q, getCurrentUsername()));
    }

    // ─── Recipe CRUD ────────────────────────────────────────────────────────────
    @PostMapping("/recipes")
    public ResponseEntity<RecipeResponse> createRecipe(@Valid @RequestBody RecipeRequest request) {
        return ResponseEntity.ok(recipeService.createRecipe(request, getCurrentUsername()));
    }

    @GetMapping("/recipes/{id}")
    public ResponseEntity<RecipeResponse> getRecipeById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(recipeService.getRecipeById(id, getCurrentUsername()));
    }

    @PutMapping("/recipes/{id}")
    public ResponseEntity<RecipeResponse> updateRecipe(
            @PathVariable("id") Long id, @Valid @RequestBody RecipeRequest request) {
        return ResponseEntity.ok(recipeService.updateRecipe(id, request, getCurrentUsername()));
    }

    @DeleteMapping("/recipes/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable("id") Long id) {
        recipeService.deleteRecipe(id, getCurrentUsername());
        return ResponseEntity.noContent().build();
    }

    // ─── User Profile Lists ─────────────────────────────────────────────────────
    @GetMapping("/users/{username}/recipes")
    public ResponseEntity<List<RecipeResponse>> getUserRecipes(
            @PathVariable("username") String username) {
        return ResponseEntity.ok(recipeService.getUserRecipes(username, getCurrentUsername()));
    }

    @GetMapping("/users/{username}/liked-recipes")
    public ResponseEntity<List<RecipeResponse>> getLikedRecipes(
            @PathVariable("username") String username) {
        return ResponseEntity.ok(recipeService.getUserLikedRecipes(username, getCurrentUsername()));
    }

    @GetMapping("/cloudinary/signature")
    public ResponseEntity<Map<String, String>> getCloudinarySignature(
            @RequestParam(name = "folder") String folder) {
        return ResponseEntity.ok(cloudinaryService.generateSignedUploadUrl(folder));
    }
}