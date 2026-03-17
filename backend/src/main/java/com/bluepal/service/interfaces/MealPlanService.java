package com.bluepal.service.interfaces;

import com.bluepal.dto.response.MealPlanResponse;
import com.bluepal.entity.User;

import java.time.LocalDate;
import java.util.List;

public interface MealPlanService {
    MealPlanResponse addMealPlan(User user, Long recipeId, LocalDate date, String mealType);
    List<MealPlanResponse> getMealPlans(User user, LocalDate startDate, LocalDate endDate);
    void deleteMealPlan(Long id, User user);
}
