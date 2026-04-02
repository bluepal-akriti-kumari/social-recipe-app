package com.bluepal.service.impl;

import com.bluepal.entity.*;
import com.bluepal.repository.ShoppingListItemRepository;
import com.bluepal.repository.RecipeRepository;
import com.bluepal.repository.MealPlanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ShoppingListServiceImplTest {

    @Mock
    private ShoppingListItemRepository shoppingListItemRepository;
    @Mock
    private RecipeRepository recipeRepository;
    @Mock
    private MealPlanRepository mealPlanRepository;

    @InjectMocks
    private ShoppingListServiceImpl shoppingListService;

    private User user;
    private ShoppingListItem item;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).build();
        item = ShoppingListItem.builder().id(10L).user(user).name("Milk").purchased(false).build();
    }

    @Test
    void addItem_NewItem() {
        when(shoppingListItemRepository.findByUserAndNameAndUnitAndPurchased(any(), any(), any(), anyBoolean()))
                .thenReturn(Optional.empty());
        when(shoppingListItemRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        ShoppingListItem result = shoppingListService.addItem(user, "Onion", "2", "pcs", null);

        assertNotNull(result);
        assertEquals("Onion", result.getName());
        assertEquals(ShoppingCategory.VEGETABLES, result.getCategory());
    }

    @Test
    void addItem_MergeQuantities() {
        item.setQuantity("1");
        when(shoppingListItemRepository.findByUserAndNameAndUnitAndPurchased(any(), any(), any(), anyBoolean()))
                .thenReturn(Optional.of(item));
        when(shoppingListItemRepository.save(any())).thenReturn(item);

        shoppingListService.addItem(user, "Milk", "2", "liter", null);

        assertEquals("3", item.getQuantity());
    }

    @Test
    void addIngredientsFromRecipe_Success() {
        Recipe recipe = Recipe.builder().id(100L).ingredients(new ArrayList<>()).build();
        recipe.addIngredient(Ingredient.builder().name("Sugar").quantity("100").unit("g").build());
        
        when(recipeRepository.findById(100L)).thenReturn(Optional.of(recipe));
        when(shoppingListItemRepository.findByUserAndNameAndUnitAndPurchased(any(), any(), any(), anyBoolean()))
                .thenReturn(Optional.empty());

        shoppingListService.addIngredientsFromRecipe(100L, user);

        verify(shoppingListItemRepository, times(1)).save(any(ShoppingListItem.class));
    }

    @Test
    void addIngredientsFromMealPlan_Success() {
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(1);
        Recipe recipe = Recipe.builder().id(100L).ingredients(new ArrayList<>()).build();
        MealPlan plan = MealPlan.builder().recipe(recipe).build();
        
        when(mealPlanRepository.findByUserAndPlannedDateBetween(user, start, end)).thenReturn(List.of(plan));
        when(recipeRepository.findById(100L)).thenReturn(Optional.of(recipe));

        shoppingListService.addIngredientsFromMealPlan(user, start, end);

        verify(recipeRepository).findById(100L);
    }
}
