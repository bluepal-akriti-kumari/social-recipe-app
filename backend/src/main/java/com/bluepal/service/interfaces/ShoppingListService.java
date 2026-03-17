package com.bluepal.service.interfaces;

import com.bluepal.entity.ShoppingListItem;
import com.bluepal.entity.User;

import java.util.List;

public interface ShoppingListService {
    ShoppingListItem addItem(User user, String name, String quantity, String unit);
    List<ShoppingListItem> getItems(User user);
    ShoppingListItem togglePurchased(Long id, User user);
    void deleteCheckedItems(User user);
    void addIngredientsFromRecipe(Long recipeId, User user);
}
