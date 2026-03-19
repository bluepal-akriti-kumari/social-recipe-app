package com.bluepal.repository;

import com.bluepal.entity.Rating;
import com.bluepal.entity.Recipe;
import com.bluepal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    Optional<Rating> findByUserAndRecipe(User user, Recipe recipe);
    boolean existsByUserAndRecipe(User user, Recipe recipe);
    
    long countByRecipe(Recipe recipe);
    
    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.recipe = :recipe")
    Double getAverageRatingByRecipe(@Param("recipe") Recipe recipe);
    
    @Modifying
    @Transactional
    void deleteByRecipe(Recipe recipe);
}
