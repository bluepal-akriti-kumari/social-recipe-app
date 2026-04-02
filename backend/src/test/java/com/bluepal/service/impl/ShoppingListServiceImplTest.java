package com.bluepal.service.impl;

import com.bluepal.entity.*;
import com.bluepal.exception.ResourceNotFoundException;
import com.bluepal.repository.MealPlanRepository;
import com.bluepal.repository.RecipeRepository;
import com.bluepal.repository.ShoppingListItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ShoppingListServiceImplTest {

    @Mock
    private ShoppingListItemRepository shoppingListItemRepository;

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private MealPlanRepository mealPlanRepository;

    @InjectMocks
    private ShoppingListServiceImpl shoppingListService;

    private User user;
    private Recipe recipe;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");

        recipe = new Recipe();
        recipe.setId(100L);
        recipe.setTitle("Test Recipe");
        recipe.setIngredients(List.of(
            Ingredient.builder().name("Onion").quantity("1").unit("pcs").build(),
            Ingredient.builder().name("Milk").quantity("500").unit("ml").build()
        ));
    }

    @Test
    void addItem_NewItem_Success() {
        when(shoppingListItemRepository.findByUserAndNameAndUnitAndPurchased(any(), anyString(), anyString(), eq(false)))
            .thenReturn(Optional.empty());
        when(shoppingListItemRepository.save(any(ShoppingListItem.class))).thenAnswer(i -> i.getArgument(0));

        ShoppingListItem item = shoppingListService.addItem(user, "Onion", "1", "pcs", recipe);

        assertNotNull(item);
        assertEquals("Onion", item.getName());
        assertEquals(ShoppingCategory.VEGETABLES, item.getCategory());
        verify(shoppingListItemRepository).save(any());
    }

    @Test
    void addItem_ExistingItem_MergesQuantities() {
        ShoppingListItem existing = ShoppingListItem.builder()
            .user(user)
            .name("Milk")
            .quantity("500")
            .unit("ml")
            .build();

        when(shoppingListItemRepository.findByUserAndNameAndUnitAndPurchased(user, "Milk", "ml", false))
            .thenReturn(Optional.of(existing));
        when(shoppingListItemRepository.save(existing)).thenReturn(existing);

        shoppingListService.addItem(user, "Milk", "250", "ml", null);

        assertEquals("750", existing.getQuantity());
        verify(shoppingListItemRepository).save(existing);
    }

    @Test
    void mergeQuantities_NonNumeric_Success() {
        ShoppingListItem existing = ShoppingListItem.builder()
            .user(user)
            .name("Salt")
            .quantity("pinch")
            .unit("to taste")
            .build();

        when(shoppingListItemRepository.findByUserAndNameAndUnitAndPurchased(user, "Salt", "to taste", false))
            .thenReturn(Optional.of(existing));
        when(shoppingListItemRepository.save(existing)).thenReturn(existing);

        shoppingListService.addItem(user, "Salt", "extra", "to taste", null);

        assertEquals("pinch + extra", existing.getQuantity());
    }

    @Test
    void togglePurchased_Success() {
        ShoppingListItem item = ShoppingListItem.builder()
            .id(1L)
            .user(user)
            .purchased(false)
            .build();

        when(shoppingListItemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(shoppingListItemRepository.save(any())).thenReturn(item);

        shoppingListService.togglePurchased(1L, user);

        assertTrue(item.isPurchased());
    }

    @Test
    void togglePurchased_NotFound() {
        when(shoppingListItemRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> shoppingListService.togglePurchased(999L, user));
    }

    @Test
    void addIngredientsFromRecipe_Success() {
        when(recipeRepository.findById(100L)).thenReturn(Optional.of(recipe));
        when(shoppingListItemRepository.findByUserAndNameAndUnitAndPurchased(any(), any(), any(), anyBoolean()))
            .thenReturn(Optional.empty());

        shoppingListService.addIngredientsFromRecipe(100L, user);

        verify(shoppingListItemRepository, times(2)).save(any());
    }
}
