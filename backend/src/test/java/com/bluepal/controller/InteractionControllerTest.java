package com.bluepal.controller;

import com.bluepal.dto.request.CommentRequest;
import com.bluepal.entity.Comment;
import com.bluepal.entity.Recipe;
import com.bluepal.entity.User;
import com.bluepal.repository.CommentRepository;
import com.bluepal.repository.LikeRepository;
import com.bluepal.repository.RecipeRepository;
import com.bluepal.repository.UserRepository;
import com.bluepal.service.NotificationService;
import com.bluepal.service.interfaces.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(InteractionController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
public class InteractionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LikeRepository likeRepository;

    @MockBean
    private CommentRepository commentRepository;

    @MockBean
    private RecipeRepository recipeRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private NotificationService notificationService;

    @MockBean
    private UserService userService;

    @MockBean
    private com.bluepal.service.impl.ModerationService moderationService;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private com.bluepal.security.JwtUtils jwtUtils;

    @MockBean
    private com.bluepal.security.CustomUserDetailsService customUserDetailsService;

    private User mockUser;
    private Recipe mockRecipe;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("testuser");

        mockRecipe = new Recipe();
        mockRecipe.setId(1L);
        mockRecipe.setTitle("Test Recipe");
        mockRecipe.setAuthor(mockUser);
        mockRecipe.setLikeCount(5);
    }

    @Test
    @WithMockUser(username = "testuser")
    void toggleLike_AlreadyLiked_Unlikes() throws Exception {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(recipeRepository.findById(1L)).thenReturn(Optional.of(mockRecipe));
        
        // Atomic toggle called then we check exists (as per current controller logic)
        when(likeRepository.existsByUserAndRecipe(any(), any())).thenReturn(false);

        mockMvc.perform(post("/api/recipes/1/like")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.liked").value(false))
                .andExpect(jsonPath("$.likeCount").value(4));

        verify(likeRepository).toggleLikeAtomic(1L, 1L);
        verify(recipeRepository).decrementLikeCount(1L);
    }

    @Test
    @WithMockUser(username = "testuser")
    void toggleLike_NotLiked_Likes() throws Exception {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(recipeRepository.findById(1L)).thenReturn(Optional.of(mockRecipe));
        
        // Atomic toggle called then we check exists
        when(likeRepository.existsByUserAndRecipe(any(), any())).thenReturn(true);

        mockMvc.perform(post("/api/recipes/1/like")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.liked").value(true))
                .andExpect(jsonPath("$.likeCount").value(6));

        verify(likeRepository).toggleLikeAtomic(1L, 1L);
        verify(recipeRepository).incrementLikeCount(1L);
    }

    @Test
    @WithMockUser(username = "testuser")
    void addComment_Success() throws Exception {
        CommentRequest request = new CommentRequest();
        request.setContent("Nice recipe!");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(recipeRepository.findById(1L)).thenReturn(Optional.of(mockRecipe));
        
        Comment savedComment = new Comment();
        savedComment.setId(1L);
        savedComment.setContent("Nice recipe!");
        savedComment.setUser(mockUser);
        savedComment.setRecipe(mockRecipe);
        
        when(commentRepository.save(any())).thenReturn(savedComment);

        mockMvc.perform(post("/api/recipes/1/comments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Nice recipe!"))
                .andExpect(jsonPath("$.username").value("testuser"));

        verify(recipeRepository).incrementCommentCount(1L);
    }

    @Test
    void toggleLike_Unauthenticated_Returns401() throws Exception {
        mockMvc.perform(post("/api/recipes/1/like")
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }
}
