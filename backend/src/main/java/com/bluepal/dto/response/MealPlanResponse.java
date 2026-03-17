package com.bluepal.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class MealPlanResponse {
    private Long id;
    private Long recipeId;
    private String recipeTitle;
    private String recipeImageUrl;
    private LocalDate plannedDate;
    private String mealType;
}
