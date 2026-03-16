package com.bluepal.service.interfaces;

import com.bluepal.dto.request.RecipeRequest;
import com.bluepal.dto.response.RecipeResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface RecipeService {
    RecipeResponse createRecipe(RecipeRequest request, String username);
    RecipeResponse getRecipeById(Long id, String currentUsername);
    
    // Cursor-based feeds for Infinite Scroll
    Map<String, Object> getExploreFeedCursor(LocalDateTime cursor, int size, String currentUsername);
    Map<String, Object> getPersonalizedFeedCursor(String username, LocalDateTime cursor, int size);
    
    // Full-text search by ingredient
    List<RecipeResponse> searchRecipesFullText(String query, String currentUsername);

    List<RecipeResponse> getUserRecipes(String username, String currentUsername);
    List<RecipeResponse> getUserLikedRecipes(String username, String currentUsername);
    RecipeResponse updateRecipe(Long id, RecipeRequest request, String username);
    void deleteRecipe(Long id, String username);
}