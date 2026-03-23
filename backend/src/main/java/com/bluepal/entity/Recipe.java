package com.bluepal.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recipes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "prep_time_minutes")
    private Integer prepTimeMinutes;

    @Column(name = "cook_time_minutes")
    private Integer cookTimeMinutes;

    private Integer servings;

    private Integer calories;
    private Double protein;
    private Double carbs;
    private Double fats;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Builder.Default
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Ingredient> ingredients = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Step> steps = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecipeImage> images = new ArrayList<>();

    @Builder.Default
    @Column(name = "like_count", nullable = false)
    private Integer likeCount = 0;

    @Builder.Default
    @Column(name = "comment_count", nullable = false)
    private Integer commentCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private RecipeCategory category;

    @Builder.Default
    @Column(name = "average_rating")
    private Double averageRating = 0.0;

    @Builder.Default
    @Column(name = "rating_count")
    private Integer ratingCount = 0;

    @Builder.Default
    @Column(name = "is_published", nullable = false)
    private boolean isPublished = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper methods to keep bi-directional relationships in sync
    public void addIngredient(Ingredient ingredient) {
        ingredients.add(ingredient);
        ingredient.setRecipe(this);
    }

    public void removeIngredient(Ingredient ingredient) {
        ingredients.remove(ingredient);
        ingredient.setRecipe(null);
    }

    public void addStep(Step step) {
        steps.add(step);
        step.setRecipe(this);
    }

    public void removeStep(Step step) {
        steps.remove(step);
        step.setRecipe(null);
    }

    public void addImage(RecipeImage image) {
        images.add(image);
        image.setRecipe(this);
    }

    public void removeImage(RecipeImage image) {
        images.remove(image);
        image.setRecipe(null);
    }
}
