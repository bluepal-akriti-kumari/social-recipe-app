package com.bluepal.service.impl;

import com.bluepal.entity.Recipe;
import com.bluepal.entity.ShoppingListItem;
import com.bluepal.entity.User;
import com.bluepal.repository.RecipeRepository;
import com.bluepal.repository.ShoppingListItemRepository;
import com.bluepal.repository.UserRepository;
import com.bluepal.repository.MealPlanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ShoppingListServiceImplTest {

    @Mock
    private ShoppingListItemRepository shoppingListItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RecipeRepository recipeRepository;
    
    @Mock
    private MealPlanRepository mealPlanRepository;

    @InjectMocks
    private ShoppingListServiceImpl shoppingListService;

    private User mockUser;
    private Recipe mockRecipe;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("testuser");

        mockRecipe = new Recipe();
        mockRecipe.setId(1L);
        mockRecipe.setTitle("Test Recipe");
    }

    @Test
    void getItems_Success() {
        when(shoppingListItemRepository.findByUserOrderByCategoryAsc(mockUser)).thenReturn(Collections.emptyList());

        List<ShoppingListItem> result = shoppingListService.getItems(mockUser);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void addItem_NewItem_Success() {
        when(shoppingListItemRepository.findByUserAndNameAndUnitAndPurchased(any(), any(), any(), eq(false)))
                .thenReturn(Optional.empty());
        
        ShoppingListItem savedItem = new ShoppingListItem();
        savedItem.setName("Milk");
        when(shoppingListItemRepository.save(any())).thenReturn(savedItem);

        ShoppingListItem result = shoppingListService.addItem(mockUser, "Milk", "1", "L", null);

        assertNotNull(result);
        assertEquals("Milk", result.getName());
        verify(shoppingListItemRepository).save(any());
    }

    @Test
    void togglePurchased_Success() {
        ShoppingListItem item = new ShoppingListItem();
        item.setId(1L);
        item.setPurchased(false);
        item.setUser(mockUser);

        when(shoppingListItemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(shoppingListItemRepository.save(any())).thenReturn(item);

        ShoppingListItem result = shoppingListService.togglePurchased(1L, mockUser);

        assertTrue(result.isPurchased());
        verify(shoppingListItemRepository).save(item);
    }

    @Test
    void deleteCheckedItems_Success() {
        shoppingListService.deleteCheckedItems(mockUser);

        verify(shoppingListItemRepository).deleteByUserAndPurchased(mockUser, true);
    }
}
