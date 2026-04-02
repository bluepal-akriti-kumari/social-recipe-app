package com.bluepal.service.impl;

import com.bluepal.dto.request.UpdateProfileRequest;
import com.bluepal.dto.response.UserProfileResponse;
import com.bluepal.entity.User;
import com.bluepal.repository.UserRepository;
import com.bluepal.repository.FollowRepository;
import com.bluepal.repository.RecipeRepository;
import com.bluepal.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.HashSet;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RecipeRepository recipeRepository;
    @Mock
    private FollowRepository followRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private UserServiceImpl userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .roles(new HashSet<>())
                .reputationPoints(0)
                .build();
    }

    @Test
    void getUserProfile_Success() {
        when(userRepository.findByUsernameIgnoreCase("testuser")).thenReturn(Optional.of(user));
        when(recipeRepository.countByAuthor(user)).thenReturn(10L);
        
        UserProfileResponse response = userService.getUserProfile("testuser", "viewer");
        
        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
    }

    @Test
    void followUser_Success() {
        User target = User.builder().id(2L).username("target").followerCount(0).build();
        user.setFollowingCount(0);
        
        when(userRepository.findByUsernameIgnoreCase("testuser")).thenReturn(Optional.of(user));
        when(userRepository.findByUsernameIgnoreCase("target")).thenReturn(Optional.of(target));
        when(followRepository.existsByFollowerAndFollowing(user, target)).thenReturn(false);

        userService.followUser("testuser", "target");

        verify(followRepository).save(any());
        assertEquals(1, target.getFollowerCount());
        assertEquals(1, user.getFollowingCount());
    }

    @Test
    void updateProfile_Success() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setBio("New Bio");
        
        when(userRepository.findByUsernameIgnoreCase("testuser")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);
        
        userService.updateProfile("testuser", request);
        
        assertEquals("New Bio", user.getBio());
        verify(userRepository).save(user);
    }
}
