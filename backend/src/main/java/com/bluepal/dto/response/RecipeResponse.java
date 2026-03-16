package com.bluepal.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecipeResponse {
    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private Integer prepTimeMinutes;
    private Integer cookTimeMinutes;
    private Integer servings;
    private Integer likeCount;
    private Integer commentCount;
    private Boolean isLiked; // true if current user has liked this recipe
    private AuthorDto author;
    private List<IngredientDto> ingredients;
    private List<StepDto> steps;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AuthorDto {
        private Long id;
        private String username;
        private String profilePictureUrl;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class IngredientDto {
        private Long id;
        private String name;
        private String quantity;
        private String unit;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class StepDto {
        private Long id;
        private Integer stepNumber;
        private String instruction;
    }
}
