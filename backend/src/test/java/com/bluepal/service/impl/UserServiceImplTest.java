package com.bluepal.service.impl;

import com.bluepal.dto.request.UpdateProfileRequest;
import com.bluepal.dto.response.UserProfileResponse;
import com.bluepal.entity.Follow;
import com.bluepal.entity.NotificationType;
import com.bluepal.entity.User;
import com.bluepal.exception.ResourceNotFoundException;
import com.bluepal.repository.FollowRepository;
import com.bluepal.repository.RecipeRepository;
import com.bluepal.repository.UserRepository;
import com.bluepal.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private FollowRepository followRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private RecipeRepository recipeRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private User user;
    private User follower;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .followerCount(0)
                .followingCount(0)
                .reputationPoints(0)
                .reputationLevel("Commis Chef")
                .build();

        follower = User.builder()
                .id(2L)
                .username("follower")
                .email("follower@example.com")
                .followerCount(0)
                .followingCount(0)
                .build();
    }

    @Test
    void getUserProfile_Success() {
        when(userRepository.findByUsernameIgnoreCase("testuser")).thenReturn(Optional.of(user));
        when(userRepository.findByUsernameIgnoreCase("follower")).thenReturn(Optional.of(follower));
        when(followRepository.existsByFollowerAndFollowing(follower, user)).thenReturn(true);
        when(recipeRepository.countByAuthor(user)).thenReturn(5L);

        UserProfileResponse response = userService.getUserProfile("testuser", "follower");

        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
        assertTrue(response.getIsFollowing());
        verify(userRepository, times(2)).findByUsernameIgnoreCase(anyString());
    }

    @Test
    void getUserProfile_UserNotFound() {
        when(userRepository.findByUsernameIgnoreCase("unknown")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getUserProfile("unknown", null));
    }

    @Test
    void toggleFollow_Follow() {
        when(userRepository.findByUsernameIgnoreCase("follower")).thenReturn(Optional.of(follower));
        when(userRepository.findByUsernameIgnoreCase("testuser")).thenReturn(Optional.of(user));
        when(followRepository.findByFollowerAndFollowing(follower, user)).thenReturn(Optional.empty());

        userService.toggleFollow("follower", "testuser");

        verify(followRepository, times(1)).save(any(Follow.class));
        verify(notificationService, times(1)).createAndSendNotification(eq(user), eq(follower), eq(NotificationType.FOLLOW), isNull(), anyString());
        assertEquals(1, user.getFollowerCount());
        assertEquals(1, follower.getFollowingCount());
    }

    @Test
    void toggleFollow_Unfollow() {
        when(userRepository.findByUsernameIgnoreCase("follower")).thenReturn(Optional.of(follower));
        when(userRepository.findByUsernameIgnoreCase("testuser")).thenReturn(Optional.of(user));
        Follow follow = new Follow(1L, follower, user, null);
        when(followRepository.findByFollowerAndFollowing(follower, user)).thenReturn(Optional.of(follow));
        
        user.setFollowerCount(1);
        follower.setFollowingCount(1);

        userService.toggleFollow("follower", "testuser");

        verify(followRepository, times(1)).delete(follow);
        assertEquals(0, user.getFollowerCount());
        assertEquals(0, follower.getFollowingCount());
    }

    @Test
    void updateProfile_Success() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setBio("New Bio");
        when(userRepository.findByUsernameIgnoreCase("testuser")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserProfileResponse response = userService.updateProfile("testuser", request);

        assertEquals("New Bio", user.getBio());
        assertEquals("New Bio", response.getBio());
    }

    @Test
    void updateReputation_LevelUp() {
        when(userRepository.findByUsernameIgnoreCase("testuser")).thenReturn(Optional.of(user));

        userService.updateReputation("testuser", 500);

        assertEquals(500, user.getReputationPoints());
        assertEquals("Chef de Partie", user.getReputationLevel());
        verify(userRepository, times(1)).save(user);
    }
}
