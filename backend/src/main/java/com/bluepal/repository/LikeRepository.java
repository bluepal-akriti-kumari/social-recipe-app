package com.bluepal.repository;

import com.bluepal.entity.Like;
import com.bluepal.entity.Recipe;
import com.bluepal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
    long deleteByUserAndRecipe(User user, Recipe recipe);
    
    @Modifying
    @Transactional
    void deleteByRecipe(Recipe recipe);
}