package com.bluepal.service.impl;

import com.bluepal.dto.request.RecipeRequest;
import com.bluepal.dto.response.RecipeResponse;
import com.bluepal.entity.*;
import com.bluepal.repository.*;
import com.bluepal.service.interfaces.BookmarkService;
import com.bluepal.service.interfaces.RatingService;
import com.bluepal.service.interfaces.UserService;
import com.bluepal.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;
import java.util.Map;
import java.util.HashSet;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecipeServiceImplTest {

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
    private CategoryRepository categoryRepository;
    @Mock
    private RatingService ratingService;
    @Mock
    private BookmarkService bookmarkService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private UserService userService;

    @InjectMocks
    private RecipeServiceImpl recipeService;

    private User author;
    private Recipe recipe;
    private RecipeRequest recipeRequest;

    @BeforeEach
    void setUp() {
        author = User.builder().id(1L).username("chef1").reputationPoints(0).roles(new HashSet<>()).build();
        recipe = Recipe.builder().id(100L).title("Test").author(author).createdAt(LocalDateTime.now()).build();
        recipeRequest = new RecipeRequest();
        recipeRequest.setTitle("Test");
    }

    @Test
    void createRecipe_Success() {
        when(userRepository.findByUsername("chef1")).thenReturn(Optional.of(author));
        when(categoryRepository.findByNameIgnoreCase(any())).thenReturn(Optional.of(new Category("General")));
        when(recipeRepository.save(any(Recipe.class))).thenReturn(recipe);

        RecipeResponse response = recipeService.createRecipe(recipeRequest, "chef1");

        assertNotNull(response);
        assertEquals(50, author.getReputationPoints());
        verify(recipeRepository).save(any(Recipe.class));
    }

    @Test
    @SuppressWarnings("unchecked")
    void toggleLike_Success() {
        when(userRepository.findByUsername("chef1")).thenReturn(Optional.of(author));
        when(recipeRepository.findById(100L)).thenReturn(Optional.of(recipe));
        when(likeRepository.existsByUserAndRecipe(author, recipe)).thenReturn(true);

        Map<String, Object> result = recipeService.toggleLike(100L, "chef1");

        assertTrue((Boolean) result.get("liked"));
    }

    @Test
    void markAsPremium_Success() {
        when(recipeRepository.findById(100L)).thenReturn(Optional.of(recipe));
        recipeService.markAsPremium(100L);
        assertTrue(recipe.isPremium());
        verify(recipeRepository).save(recipe);
    }
}
