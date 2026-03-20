package com.bluepal.service.impl;

import com.bluepal.dto.request.RecipeRequest;
import com.bluepal.dto.response.RecipeResponse;
import com.bluepal.entity.*;
import com.bluepal.exception.ResourceNotFoundException;
import com.bluepal.repository.*;
import com.bluepal.service.interfaces.BookmarkService;
import com.bluepal.service.interfaces.RatingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RecipeServiceImplTest {

    @Mock
    private RecipeRepository recipeRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private MealPlanRepository mealPlanRepository;
    @Mock
    private ShoppingListItemRepository shoppingListItemRepository;
    @Mock
    private LikeRepository likeRepository;
    @Mock
    private CommentRepository commentRepository;
    @Mock
    private BookmarkRepository bookmarkRepository;
    @Mock
    private RatingRepository ratingRepository;
    @Mock
    private RatingService ratingService;
    @Mock
    private BookmarkService bookmarkService;

    @InjectMocks
    private RecipeServiceImpl recipeService;

    private User author;
    private Recipe recipe;
    private RecipeRequest recipeRequest;

    @BeforeEach
    void setUp() {
        author = User.builder()
                .id(1L)
                .username("chef1")
                .reputationPoints(0)
                .build();

        recipe = Recipe.builder()
                .id(1L)
                .title("Test Recipe")
                .description("Test Description")
                .author(author)
                .category(RecipeCategory.VEG)
                .ingredients(new ArrayList<>())
                .steps(new ArrayList<>())
                .images(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .build();

        recipeRequest = new RecipeRequest();
        recipeRequest.setTitle("Test Recipe");
        recipeRequest.setDescription("Test Description");
        recipeRequest.setCategory("VEG");
    }

    @Test
    void createRecipe_Success() {
        when(userRepository.findByUsername("chef1")).thenReturn(Optional.of(author));
        when(recipeRepository.save(any(Recipe.class))).thenReturn(recipe);

        RecipeResponse response = recipeService.createRecipe(recipeRequest, "chef1");

        assertNotNull(response);
        assertEquals("Test Recipe", response.getTitle());
        assertEquals(50, author.getReputationPoints());
        verify(recipeRepository, times(1)).save(any(Recipe.class));
        verify(userRepository, times(1)).save(author);
    }

    @Test
    void getRecipeById_Success() {
        when(recipeRepository.findById(1L)).thenReturn(Optional.of(recipe));

        RecipeResponse response = recipeService.getRecipeById(1L, null);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        verify(recipeRepository, times(1)).findById(1L);
    }

    @Test
    void updateRecipe_Success() {
        when(recipeRepository.findById(1L)).thenReturn(Optional.of(recipe));
        when(recipeRepository.save(any(Recipe.class))).thenReturn(recipe);

        recipeRequest.setTitle("Updated Title");
        RecipeResponse response = recipeService.updateRecipe(1L, recipeRequest, "chef1");

        assertNotNull(response);
        assertEquals("Updated Title", recipe.getTitle());
        verify(recipeRepository, times(1)).save(recipe);
    }

    @Test
    void deleteRecipe_Success() {
        when(recipeRepository.findById(1L)).thenReturn(Optional.of(recipe));
        when(userRepository.findByUsername("chef1")).thenReturn(Optional.of(author));

        recipeService.deleteRecipe(1L, "chef1");

        verify(recipeRepository, times(1)).delete(recipe);
        verify(likeRepository, times(1)).deleteByRecipe(recipe);
    }

    @Test
    void deleteRecipe_Unauthorized() {
        User otherUser = User.builder().username("other").roles(new java.util.HashSet<>()).build();
        when(recipeRepository.findById(1L)).thenReturn(Optional.of(recipe));
        when(userRepository.findByUsername("other")).thenReturn(Optional.of(otherUser));

        assertThrows(RuntimeException.class, () -> recipeService.deleteRecipe(1L, "other"));
    }

    @Test
    void searchRecipes_Success() {
        when(recipeRepository.searchRecipesFullText("test")).thenReturn(java.util.List.of(recipe));

        java.util.List<RecipeResponse> result = recipeService.searchRecipesFullText("test", null);

        assertFalse(result.isEmpty());
        assertEquals("Test Recipe", result.get(0).getTitle());
    }

    @Test
    void getExploreFeed_Success() {
        when(recipeRepository.findAllByOrderByCreatedAtDesc(any())).thenReturn(java.util.List.of(recipe));

        java.util.Map<String, Object> result = recipeService.getExploreFeedCursor(null, 10, null);

        assertFalse(((java.util.List)result.get("content")).isEmpty());
    }

    @Test
    void getPersonalizedFeed_Success() {
        when(userRepository.findByUsername("chef1")).thenReturn(Optional.of(author));
        when(recipeRepository.findPersonalizedLatest(any(), any())).thenReturn(java.util.List.of(recipe));

        java.util.Map<String, Object> result = recipeService.getPersonalizedFeedCursor("chef1", null, 10);

        assertFalse(((java.util.List)result.get("content")).isEmpty());
    }

    @Test
    void getTrendingRecipes_Success() {
        when(recipeRepository.findTrending(any())).thenReturn(java.util.List.of(recipe));

        java.util.List<RecipeResponse> result = recipeService.getTrendingRecipes(null, 10);

        assertFalse(result.isEmpty());
    }
}
