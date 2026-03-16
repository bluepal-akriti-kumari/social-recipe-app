
package com.bluepal.controller;

import com.bluepal.dto.request.CommentRequest;
import com.bluepal.dto.response.CommentResponse;
import com.bluepal.entity.Comment;
import com.bluepal.entity.Like;
import com.bluepal.entity.Recipe;
import com.bluepal.entity.User;
import com.bluepal.exception.ResourceNotFoundException;
import com.bluepal.repository.CommentRepository;
import com.bluepal.repository.LikeRepository;
import com.bluepal.repository.RecipeRepository;
import com.bluepal.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class InteractionController {

    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;

    public InteractionController(LikeRepository likeRepository, CommentRepository commentRepository,
                                 RecipeRepository recipeRepository, UserRepository userRepository) {
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            return auth.getName();
        }
        return null;
    }

    // ─── Like / Unlike Toggle ──────────────────────────────────────────────────
    @PostMapping("/recipes/{id}/like")
    @Transactional
    public ResponseEntity<?> toggleLike(@PathVariable("id") Long id) {
        String username = getCurrentUsername();
        if (username == null) return ResponseEntity.status(401).body("Auth required");

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));

        Optional<Like> existing = likeRepository.findByUserAndRecipe(user, recipe);

        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            recipe.setLikeCount(Math.max(0, recipe.getLikeCount() - 1));
            recipeRepository.save(recipe);
            return ResponseEntity.ok(Map.of("liked", false, "likeCount", recipe.getLikeCount()));
        } else {
            likeRepository.save(Like.builder().user(user).recipe(recipe).build());
            recipe.setLikeCount(recipe.getLikeCount() + 1);
            recipeRepository.save(recipe);
            return ResponseEntity.ok(Map.of("liked", true, "likeCount", recipe.getLikeCount()));
        }
    }

    // ─── Comments ──────────────────────────────────────────────────────────────
    @PostMapping("/recipes/{id}/comments")
    @Transactional
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable("id") Long id, 
            @Valid @RequestBody CommentRequest request) {
        
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .user(user)
                .recipe(recipe)
                .build();
        
        if (request.getParentId() != null) {
            Comment parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", request.getParentId()));
            comment.setParent(parent);
        }
        
        Comment saved = commentRepository.save(comment);
        recipe.setCommentCount(recipe.getCommentCount() + 1);
        recipeRepository.save(recipe);

        return ResponseEntity.ok(mapToCommentResponse(saved));
    }

    @GetMapping("/recipes/{id}/comments")
    public ResponseEntity<Page<CommentResponse>> getComments(
            @PathVariable("id") Long id,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));
        
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(commentRepository.findByRecipeOrderByCreatedAtDesc(recipe, pageable)
                .map(this::mapToCommentResponse));
    }

    private CommentResponse mapToCommentResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .username(comment.getUser().getUsername())
                .userProfilePictureUrl(comment.getUser().getProfilePictureUrl())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
