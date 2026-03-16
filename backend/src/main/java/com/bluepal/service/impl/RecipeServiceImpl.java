package com.bluepal.service.impl;

import com.bluepal.dto.request.IngredientRequest;
import com.bluepal.dto.request.RecipeRequest;
import com.bluepal.dto.request.StepRequest;
import com.bluepal.dto.response.RecipeResponse;
import com.bluepal.entity.*;
import com.bluepal.exception.ResourceNotFoundException;
import com.bluepal.repository.*;
import com.bluepal.service.interfaces.RecipeService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RecipeServiceImpl implements RecipeService {

    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;

    public RecipeServiceImpl(RecipeRepository recipeRepository, UserRepository userRepository,
                             LikeRepository likeRepository) {
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
        this.likeRepository = likeRepository;
    }

    @Override
    public Map<String, Object> getExploreFeedCursor(LocalDateTime cursor, int size, String currentUsername) {
        LocalDateTime effectiveCursor = (cursor == null) ? LocalDateTime.now() : cursor;
        Pageable limit = PageRequest.of(0, size);
        
        List<Recipe> recipes = recipeRepository.findExploreCursor(effectiveCursor, limit);
        
        List<RecipeResponse> content = recipes.stream()
                .map(r -> this.mapToResponse(r, checkIsLiked(r, currentUsername)))
                .collect(Collectors.toList());

        String nextCursor = content.isEmpty() ? "" : content.get(content.size() - 1).getCreatedAt().toString();

        return Map.of(
            "content", content,
            "nextCursor", nextCursor
        );
    }

    @Override
    public List<RecipeResponse> searchRecipesFullText(String query, String currentUsername) {
        // Prepare query for Postgres tsquery: 'chicken & rice'
        String formattedQuery = query.trim().replaceAll("\\s+", " & ");
        return recipeRepository.searchByIngredientFullText(formattedQuery).stream()
                .map(r -> this.mapToResponse(r, checkIsLiked(r, currentUsername)))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RecipeResponse createRecipe(RecipeRequest request, String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Recipe recipe = Recipe.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .prepTimeMinutes(request.getPrepTimeMinutes())
                .cookTimeMinutes(request.getCookTimeMinutes())
                .servings(request.getServings())
                .author(author)
                .likeCount(0)
                .commentCount(0)
                .build();

        if (request.getIngredients() != null) {
            request.getIngredients().forEach(ir -> recipe.addIngredient(Ingredient.builder()
                    .name(ir.getName()).quantity(ir.getQuantity()).unit(ir.getUnit()).build()));
        }

        if (request.getSteps() != null) {
            request.getSteps().forEach(sr -> recipe.addStep(Step.builder()
                    .stepNumber(sr.getStepNumber()).instruction(sr.getInstruction()).build()));
        }

        return mapToResponse(recipeRepository.save(recipe), false);
    }

    // Helper method to check if current user liked the recipe
    private boolean checkIsLiked(Recipe recipe, String username) {
        if (username == null) return false;
        return userRepository.findByUsername(username)
                .map(u -> likeRepository.existsByUserAndRecipe(u, recipe))
                .orElse(false);
    }

    // The Mapping Method that fixes your Compilation Error
    private RecipeResponse mapToResponse(Recipe recipe, boolean isLiked) {
        return RecipeResponse.builder()
                .id(recipe.getId())
                .title(recipe.getTitle())
                .description(recipe.getDescription())
                .imageUrl(recipe.getImageUrl())
                .prepTimeMinutes(recipe.getPrepTimeMinutes())
                .cookTimeMinutes(recipe.getCookTimeMinutes())
                .servings(recipe.getServings())
                .likeCount(recipe.getLikeCount())
                .commentCount(recipe.getCommentCount())
                .isLiked(isLiked)
                .createdAt(recipe.getCreatedAt())
                .author(RecipeResponse.AuthorDto.builder()
                        .id(recipe.getAuthor().getId())
                        .username(recipe.getAuthor().getUsername())
                        .profilePictureUrl(recipe.getAuthor().getProfilePictureUrl())
                        .build())
                .ingredients(recipe.getIngredients().stream().map(i ->
                        RecipeResponse.IngredientDto.builder()
                                .id(i.getId()).name(i.getName())
                                .quantity(i.getQuantity()).unit(i.getUnit())
                                .build()).collect(Collectors.toList()))
                .steps(recipe.getSteps().stream().map(s ->
                        RecipeResponse.StepDto.builder()
                                .id(s.getId()).stepNumber(s.getStepNumber())
                                .instruction(s.getInstruction())
                                .build()).collect(Collectors.toList()))
                .build();
    }

    // Remaining Required Methods (Placeholders to satisfy interface)
    @Override public RecipeResponse getRecipeById(Long id, String currentUsername) {
        Recipe recipe = recipeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));
        return mapToResponse(recipe, checkIsLiked(recipe, currentUsername));
    }
    @Override public Map<String, Object> getPersonalizedFeedCursor(String username, LocalDateTime cursor, int size) { return Map.of(); }
    @Override public List<RecipeResponse> getUserRecipes(String username, String currentUsername) { return List.of(); }
    @Override public List<RecipeResponse> getUserLikedRecipes(String username, String currentUsername) { return List.of(); }
    @Override public RecipeResponse updateRecipe(Long id, RecipeRequest request, String username) { return null; }
    @Override public void deleteRecipe(Long id, String username) { recipeRepository.deleteById(id); }
}