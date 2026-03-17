package com.bluepal.repository;

import com.bluepal.entity.Bookmark;
import com.bluepal.entity.Recipe;
import com.bluepal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findByUserOrderByCreatedAtDesc(User user);
    Optional<Bookmark> findByUserAndRecipe(User user, Recipe recipe);
    boolean existsByUserAndRecipe(User user, Recipe recipe);
    void deleteByUserAndRecipe(User user, Recipe recipe);
}
