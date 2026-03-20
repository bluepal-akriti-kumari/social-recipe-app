package com.bluepal.controller;

import com.bluepal.dto.request.ShoppingListItemRequest;
import com.bluepal.dto.response.ShoppingListItemResponse;
import com.bluepal.entity.ShoppingListItem;
import com.bluepal.entity.User;
import com.bluepal.repository.UserRepository;
import com.bluepal.service.interfaces.ShoppingListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/shopping-list")
@RequiredArgsConstructor
public class ShoppingListController {

    private final ShoppingListService shoppingListService;
    private final UserRepository userRepository;

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !authentication.getPrincipal().equals("anonymousUser")) {
            return authentication.getName();
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<ShoppingListItemResponse> addItem(@RequestBody ShoppingListItemRequest request) {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        ShoppingListItem item = shoppingListService.addItem(user, request.getName(), request.getQuantity(), request.getUnit(), null);
        return ResponseEntity.ok(mapToResponse(item));
    }

    @GetMapping
    public ResponseEntity<List<ShoppingListItemResponse>> getItems() {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<ShoppingListItem> items = shoppingListService.getItems(user);
        return ResponseEntity.ok(items.stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ShoppingListItemResponse> togglePurchased(@PathVariable Long id) {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        ShoppingListItem item = shoppingListService.togglePurchased(id, user);
        return ResponseEntity.ok(mapToResponse(item));
    }

    @DeleteMapping("/checked")
    public ResponseEntity<Void> deleteCheckedItems() {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        shoppingListService.deleteCheckedItems(user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/from-recipe/{recipeId}")
    public ResponseEntity<Void> addFromRecipe(@PathVariable Long recipeId) {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        shoppingListService.addIngredientsFromRecipe(recipeId, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/from-meal-plan")
    public ResponseEntity<Void> addFromMealPlan(
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate) {
        
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        shoppingListService.addIngredientsFromMealPlan(user, startDate, endDate);
        return ResponseEntity.ok().build();
    }

    private ShoppingListItemResponse mapToResponse(ShoppingListItem item) {
        return ShoppingListItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .quantity(item.getQuantity())
                .unit(item.getUnit())
                .category(item.getCategory() != null ? item.getCategory().name() : "OTHER")
                .recipeId(item.getRecipe() != null ? item.getRecipe().getId() : null)
                .recipeTitle(item.getRecipe() != null ? item.getRecipe().getTitle() : null)
                .purchased(item.isPurchased())
                .build();
    }
}
