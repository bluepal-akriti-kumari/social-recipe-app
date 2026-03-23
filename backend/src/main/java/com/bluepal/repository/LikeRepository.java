package com.bluepal.repository;

import com.bluepal.entity.Like;
import com.bluepal.entity.Recipe;
import com.bluepal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUserAndRecipe(User user, Recipe recipe);
    boolean existsByUserAndRecipe(User user, Recipe recipe);
    List<Like> findByUser(User user);
    
    @Modifying
    @Transactional
    void deleteByUserAndRecipe(User user, Recipe recipe);
    
    @Modifying
    @Transactional
    void deleteByRecipe(Recipe recipe);

    @Modifying
    @Transactional
    @Query(value = "WITH deleted AS (DELETE FROM likes WHERE user_id = :userId AND recipe_id = :recipeId RETURNING id) " +
                   "INSERT INTO likes (user_id, recipe_id, created_at) " +
                   "SELECT :userId, :recipeId, NOW() " +
                   "WHERE NOT EXISTS (SELECT 1 FROM deleted)", nativeQuery = true)
    void toggleLikeAtomic(@Param("userId") Long userId, @Param("recipeId") Long recipeId);
}