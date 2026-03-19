package com.bluepal.repository;

import com.bluepal.entity.Comment;
import com.bluepal.entity.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByRecipeOrderByCreatedAtDesc(Recipe recipe, Pageable pageable);
    
    // Only fetch root comments for threaded responses
    Page<Comment> findByRecipeAndParentIsNullOrderByCreatedAtDesc(Recipe recipe, Pageable pageable);
    
    @Modifying
    @Transactional
    void deleteByRecipe(Recipe recipe);
}
