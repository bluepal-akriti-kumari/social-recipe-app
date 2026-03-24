
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


@RestController
@RequestMapping("/api")
public class InteractionController {

    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final com.bluepal.service.NotificationService notificationService;

    private final com.bluepal.service.interfaces.UserService userService;
    private final com.bluepal.service.interfaces.RecipeService recipeService;

    private final com.bluepal.service.impl.ModerationService moderationService;

    public InteractionController(LikeRepository likeRepository, CommentRepository commentRepository,
                                 RecipeRepository recipeRepository, UserRepository userRepository,
                                 com.bluepal.service.NotificationService notificationService,
                                 com.bluepal.service.interfaces.UserService userService,
                                 com.bluepal.service.impl.ModerationService moderationService) {
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.userService = userService;
        this.moderationService = moderationService;
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
    public ResponseEntity<?> toggleLike(@PathVariable("id") Long id) {
        String username = getCurrentUsername();
        if (username == null) return ResponseEntity.status(401).body("Auth required");

        // Use the atomic service method instead of check-then-act logic here
        Map<String, Object> result = recipeService.toggleLike(id, username);
        return ResponseEntity.ok(result);
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
        recipeRepository.incrementCommentCount(id);

        // Send Notification
        notificationService.createAndSendNotification(
                recipe.getAuthor(),
                user,
                com.bluepal.entity.NotificationType.COMMENT,
                recipe.getId(),
                user.getUsername() + " commented on your recipe: " + recipe.getTitle()
        );

        // Award reputation points for commenting
        userService.updateReputation(user.getUsername(), 10);

        return ResponseEntity.ok(mapToCommentResponse(saved));
    }

    @GetMapping("/recipes/{id}/comments")
    @Transactional(readOnly = true)
    public ResponseEntity<Page<CommentResponse>> getComments(
            @PathVariable("id") Long id,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));
        
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(commentRepository.findByRecipeAndParentIsNullOrderByCreatedAtDesc(recipe, pageable)
                .map(this::mapToCommentResponse));
    }

    @DeleteMapping("/comments/{id}")
    @Transactional
    public ResponseEntity<?> deleteComment(@PathVariable("id") Long id) {
        String username = getCurrentUsername();
        if (username == null) return ResponseEntity.status(401).body("Auth required");

        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", id));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // RBAC: Author, Moderator, or Admin can delete
        boolean isAuthor = comment.getUser().getUsername().equals(username);
        boolean isModeratorOrAdmin = user.getRoles().stream()
                .anyMatch(r -> r.equals("ROLE_MODERATOR") || r.equals("ROLE_ADMIN"));

        if (!isAuthor && !isModeratorOrAdmin) {
            return ResponseEntity.status(403).body("Not authorized to delete this comment");
        }

        Recipe recipe = comment.getRecipe();
        recipeRepository.decrementCommentCount(recipe.getId());
        
        commentRepository.delete(comment);
        return ResponseEntity.ok("Comment deleted successfully");
    }

    @PostMapping("/reports")
    public ResponseEntity<?> reportContent(@RequestBody Map<String, Object> request) {
        String username = getCurrentUsername();
        if (username == null) return ResponseEntity.status(401).body("Auth required");

        User reporter = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        moderationService.reportContent(
                reporter,
                (String) request.get("reason"),
                (String) request.get("targetType"),
                Long.valueOf(request.get("targetId").toString())
        );

        return ResponseEntity.ok("Report submitted successfully");
    }

    private CommentResponse mapToCommentResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .username(comment.getUser().getUsername())
                .userId(comment.getUser().getId())
                .userProfilePictureUrl(comment.getUser().getProfilePictureUrl())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .createdAt(comment.getCreatedAt())
                .replies(comment.getReplies() != null ? 
                        comment.getReplies().stream().map(this::mapToCommentResponse).collect(java.util.stream.Collectors.toList()) : 
                        new java.util.ArrayList<>())
                .build();
    }
}
