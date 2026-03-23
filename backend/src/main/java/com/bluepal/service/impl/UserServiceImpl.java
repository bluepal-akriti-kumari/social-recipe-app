package com.bluepal.service.impl;

import com.bluepal.dto.response.UserProfileResponse;
import com.bluepal.entity.Follow;
import com.bluepal.entity.User;
import com.bluepal.exception.ResourceNotFoundException;
import com.bluepal.repository.FollowRepository;
import com.bluepal.repository.UserRepository;
import com.bluepal.service.interfaces.UserService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final com.bluepal.repository.RecipeRepository recipeRepository;
    private final FollowRepository followRepository;
    private final com.bluepal.service.NotificationService notificationService;

    public UserServiceImpl(UserRepository userRepository, com.bluepal.repository.RecipeRepository recipeRepository,
                           FollowRepository followRepository,
                           com.bluepal.service.NotificationService notificationService) {
        this.userRepository = userRepository;
        this.recipeRepository = recipeRepository;
        this.followRepository = followRepository;
        this.notificationService = notificationService;
    }

    @Override
    public UserProfileResponse getUserProfile(String username, String currentUsername) {
        System.out.println("DEBUG: Fetching profile for " + username + " (current: " + currentUsername + ")");
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        return buildProfileResponse(user, currentUsername);
    }

    @Override
    public UserProfileResponse getUserProfile(Long id, String currentUsername) {
        System.out.println("DEBUG: Fetching profile for ID " + id + " (current: " + currentUsername + ")");
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        return buildProfileResponse(user, currentUsername);
    }

    private UserProfileResponse buildProfileResponse(User user, String currentUsername) {
        boolean isFollowing = false;
        if (currentUsername != null) {
            Optional<User> currentUserOpt = userRepository.findByUsername(currentUsername);
            if (currentUserOpt.isPresent()) {
                isFollowing = followRepository.existsByFollowerAndFollowing(currentUserOpt.get(), user);
            }
        }

        long recipeCount = recipeRepository.countByAuthor(user);

        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .bio(user.getBio())
                .profilePictureUrl(user.getProfilePictureUrl())
                .coverPictureUrl(user.getCoverPictureUrl())
                .followerCount(user.getFollowerCount())
                .followingCount(user.getFollowingCount())
                .isFollowing(isFollowing)
                .isVerified(user.isVerified())
                .reputationPoints(user.getReputationPoints())
                .reputationLevel(user.getReputationLevel())
                .recipeCount((int) recipeCount)
                .build();
    }

    @Override
    @Transactional
    public void followUser(String followerUsername, String followingUsername) {
        if (followerUsername.equals(followingUsername)) {
            throw new IllegalArgumentException("Users cannot follow themselves");
        }

        User follower = userRepository.findByUsername(followerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", followerUsername));
        
        User following = userRepository.findByUsername(followingUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", followingUsername));

        if (!followRepository.existsByFollowerAndFollowing(follower, following)) {
            Follow follow = Follow.builder()
                    .follower(follower)
                    .following(following)
                    .build();
            followRepository.save(follow);

            following.setFollowerCount(following.getFollowerCount() + 1);
            follower.setFollowingCount(follower.getFollowingCount() + 1);
            
            userRepository.save(following);
            userRepository.save(follower);
        }
    }

    @Override
    @Transactional
    public void unfollowUser(String followerUsername, String followingUsername) {
        User following = userRepository.findByUsername(followingUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", followingUsername));
        
        performUnfollow(followerUsername, following);
    }

    @Override
    @Transactional
    public void unfollowUser(String followerUsername, Long followingId) {
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", followingId));
        
        performUnfollow(followerUsername, following);
    }

    private void performUnfollow(String followerUsername, User following) {
        User follower = userRepository.findByUsername(followerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", followerUsername));

        Optional<Follow> followOpt = followRepository.findByFollowerAndFollowing(follower, following);
        
        if (followOpt.isPresent()) {
            followRepository.delete(followOpt.get());

            following.setFollowerCount(Math.max(0, following.getFollowerCount() - 1));
            follower.setFollowingCount(Math.max(0, follower.getFollowingCount() - 1));
            
            userRepository.save(following);
            userRepository.save(follower);
        }
    }
    
    /**
     * Toggles the follow status between two users.
     * If a follow relationship exists, it is removed (unfollowed).
     * If it does not exist, it is created (followed).
     */
    @Override
    @Transactional
    public void toggleFollow(String followerUsername, String followingUsername) {
        User following = userRepository.findByUsername(followingUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", followingUsername));
        
        performToggleFollow(followerUsername, following);
    }

    @Override
    @Transactional
    public void toggleFollow(String followerUsername, Long followingId) {
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", followingId));
        
        performToggleFollow(followerUsername, following);
    }

    private void performToggleFollow(String followerUsername, User following) {
        User follower = userRepository.findByUsername(followerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", followerUsername));

        if (follower.getId().equals(following.getId())) {
            throw new IllegalArgumentException("Users cannot follow themselves");
        }

        Optional<Follow> existingFollow = followRepository.findByFollowerAndFollowing(follower, following);

        if (existingFollow.isPresent()) {
            followRepository.delete(existingFollow.get());
            following.setFollowerCount(Math.max(0, following.getFollowerCount() - 1));
            follower.setFollowingCount(Math.max(0, follower.getFollowingCount() - 1));
        } else {
            Follow newFollow = Follow.builder()
                    .follower(follower)
                    .following(following)
                    .build();
            followRepository.save(newFollow);

            following.setFollowerCount(following.getFollowerCount() + 1);
            follower.setFollowingCount(follower.getFollowingCount() + 1);

            notificationService.createAndSendNotification(
                    following,
                    follower,
                    com.bluepal.entity.NotificationType.FOLLOW,
                    null,
                    follower.getUsername() + " started following you"
            );
        }

        userRepository.save(following);
        userRepository.save(follower);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(String username, com.bluepal.dto.request.UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(request.getProfilePictureUrl());
        }
        if (request.getCoverPictureUrl() != null) {
            user.setCoverPictureUrl(request.getCoverPictureUrl());
        }

        User updatedUser = userRepository.save(user);

        return UserProfileResponse.builder()
                .id(updatedUser.getId())
                .username(updatedUser.getUsername())
                .bio(updatedUser.getBio())
                .profilePictureUrl(updatedUser.getProfilePictureUrl())
                .coverPictureUrl(updatedUser.getCoverPictureUrl())
                .followerCount(updatedUser.getFollowerCount())
                .followingCount(updatedUser.getFollowingCount())
                .isFollowing(false)
                .isVerified(updatedUser.isVerified())
                .reputationPoints(updatedUser.getReputationPoints())
                .reputationLevel(updatedUser.getReputationLevel())
                .build();
    }

    @Override
    @Transactional
    public void updateReputation(String username, int points) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        
        Integer currentPoints = user.getReputationPoints();
        if (currentPoints == null) currentPoints = 0;
        user.setReputationPoints(currentPoints + points);
        
        // Update level based on points
        if (user.getReputationPoints() >= 5000) {
            user.setReputationLevel("Michelin Star Chef");
            user.setVerified(true);
        } else if (user.getReputationPoints() >= 2000) {
            user.setReputationLevel("Executive Chef");
            user.setVerified(true);
        } else if (user.getReputationPoints() >= 1000) {
            user.setReputationLevel("Sous Chef");
        } else if (user.getReputationPoints() >= 500) {
            user.setReputationLevel("Chef de Partie");
        } else {
            user.setReputationLevel("Commis Chef");
        }
        
        userRepository.save(user);
    }
    @Override
    public java.util.List<UserProfileResponse> getFollowers(Long userId, String currentUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        return followRepository.findByFollowing(user).stream()
                .map(follow -> buildProfileResponse(follow.getFollower(), currentUsername))
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public java.util.List<UserProfileResponse> getFollowing(Long userId, String currentUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        return followRepository.findByFollower(user).stream()
                .map(follow -> buildProfileResponse(follow.getFollowing(), currentUsername))
                .collect(java.util.stream.Collectors.toList());
    }
}
