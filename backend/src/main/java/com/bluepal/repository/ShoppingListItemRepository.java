package com.bluepal.repository;

import com.bluepal.entity.ShoppingListItem;
import com.bluepal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShoppingListItemRepository extends JpaRepository<ShoppingListItem, Long> {
    List<ShoppingListItem> findByUser(User user);
    List<ShoppingListItem> findByUserOrderByCategoryAsc(User user);
    List<ShoppingListItem> findByUserAndPurchased(User user, boolean purchased);
    void deleteByUserAndPurchased(User user, boolean purchased);
    
    java.util.Optional<ShoppingListItem> findByUserAndNameAndUnitAndPurchased(User user, String name, String unit, boolean purchased);
}
