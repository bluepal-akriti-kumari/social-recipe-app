package com.bluepal.repository;

import com.bluepal.entity.Comment;
import com.bluepal.entity.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByRecipeOrderByCreatedAtDesc(Recipe recipe, Pageable pageable);
}
