package com.bluepal.repository;

import com.bluepal.entity.Rating;
import com.bluepal.entity.Recipe;
import com.bluepal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    Optional<Rating> findByUserAndRecipe(User user, Recipe recipe);
    boolean existsByUserAndRecipe(User user, Recipe recipe);
    
    long countByRecipe(Recipe recipe);
    
    @org.springframework.data.jpa.repository.Query("SELECT AVG(r.rating) FROM Rating r WHERE r.recipe = :recipe")
    Double getAverageRatingByRecipe(@org.springframework.data.repository.query.Param("recipe") Recipe recipe);
}
