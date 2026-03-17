package com.bluepal.service.impl;

import com.bluepal.dto.response.MealPlanResponse;
import com.bluepal.entity.MealPlan;
import com.bluepal.entity.Recipe;
import com.bluepal.entity.User;
import com.bluepal.repository.MealPlanRepository;
import com.bluepal.repository.RecipeRepository;
import com.bluepal.service.interfaces.MealPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MealPlanServiceImpl implements MealPlanService {

    private final MealPlanRepository mealPlanRepository;
    private final RecipeRepository recipeRepository;

    @Override
    @Transactional
    public MealPlanResponse addMealPlan(User user, Long recipeId, LocalDate date, String mealType) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        
        MealPlan mealPlan = MealPlan.builder()
                .user(user)
                .recipe(recipe)
                .plannedDate(date)
                .mealType(mealType)
                .build();
        
        return mapToResponse(mealPlanRepository.save(mealPlan));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MealPlanResponse> getMealPlans(User user, LocalDate startDate, LocalDate endDate) {
        List<MealPlan> plans = mealPlanRepository.findByUserAndPlannedDateBetween(user, startDate, endDate);
        return plans.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private MealPlanResponse mapToResponse(MealPlan mealPlan) {
        return MealPlanResponse.builder()
                .id(mealPlan.getId())
                .recipeId(mealPlan.getRecipe().getId())
                .recipeTitle(mealPlan.getRecipe().getTitle())
                .recipeImageUrl(mealPlan.getRecipe().getImageUrl())
                .plannedDate(mealPlan.getPlannedDate())
                .mealType(mealPlan.getMealType())
                .build();
    }

    @Override
    @Transactional
    public void deleteMealPlan(Long id, User user) {
        MealPlan mealPlan = mealPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meal plan not found"));
        
        if (!mealPlan.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        mealPlanRepository.delete(mealPlan);
    }
}
