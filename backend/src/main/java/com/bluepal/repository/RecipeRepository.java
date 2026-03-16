package com.bluepal.repository;

import com.bluepal.entity.Recipe;
import com.bluepal.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    // Cursor-based Explore Feed
    @Query("SELECT r FROM Recipe r WHERE r.createdAt < :cursor ORDER BY r.createdAt DESC")
    List<Recipe> findExploreCursor(@Param("cursor") LocalDateTime cursor, Pageable pageable);

    // Cursor-based Personalized Feed
    @Query("SELECT r FROM Recipe r WHERE r.author IN " +
           "(SELECT f.following FROM Follow f WHERE f.follower = :user) " +
           "AND r.createdAt < :cursor ORDER BY r.createdAt DESC")
    List<Recipe> findPersonalizedCursor(@Param("user") User user, @Param("cursor") LocalDateTime cursor, Pageable pageable);

    // Full-text search for ingredients using PostgreSQL GIN index
    @Query(value = "SELECT DISTINCT r.* FROM recipes r " +
           "JOIN ingredients i ON r.id = i.recipe_id " +
           "WHERE to_tsvector('english', i.name) @@ to_tsquery('english', :query) " +
           "ORDER BY r.created_at DESC", nativeQuery = true)
    List<Recipe> searchByIngredientFullText(@Param("query") String query);
}