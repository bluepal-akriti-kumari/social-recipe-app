package com.bluepal.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class RecipeRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String imageUrl;

    private Integer prepTimeMinutes;

    private Integer cookTimeMinutes;

    private Integer servings;

    @NotEmpty(message = "At least one ingredient is required")
    private List<IngredientRequest> ingredients;

    @NotEmpty(message = "At least one step is required")
    private List<StepRequest> steps;
}
