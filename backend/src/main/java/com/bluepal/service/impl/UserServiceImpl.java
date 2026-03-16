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
    private final FollowRepository followRepository;

    public UserServiceImpl(UserRepository userRepository, FollowRepository followRepository) {
        this.userRepository = userRepository;
        this.followRepository = followRepository;
    }

    @Override
    public UserProfileResponse getUserProfile(String username, String currentUsername) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        boolean isFollowing = false;
        if (currentUsername != null) {
            Optional<User> currentUserOpt = userRepository.findByUsername(currentUsername);
            if (currentUserOpt.isPresent()) {
                isFollowing = followRepository.existsByFollowerAndFollowing(currentUserOpt.get(), user);
            }
        }

        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .bio(user.getBio())
                .profilePictureUrl(user.getProfilePictureUrl())
                .followerCount(user.getFollowerCount())
                .followingCount(user.getFollowingCount())
                .isFollowing(isFollowing)
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
        User follower = userRepository.findByUsername(followerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", followerUsername));
        
        User following = userRepository.findByUsername(followingUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", followingUsername));

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
        if (followerUsername.equals(followingUsername)) {
            throw new IllegalArgumentException("Users cannot follow themselves");
        }

        User follower = userRepository.findByUsername(followerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", followerUsername));
        
        User following = userRepository.findByUsername(followingUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", followingUsername));

        Optional<Follow> existingFollow = followRepository.findByFollowerAndFollowing(follower, following);

        if (existingFollow.isPresent()) {
            // Logic for Unfollowing
            followRepository.delete(existingFollow.get());
            
            // Sync counts and prevent negative numbers
            following.setFollowerCount(Math.max(0, following.getFollowerCount() - 1));
            follower.setFollowingCount(Math.max(0, follower.getFollowingCount() - 1));
        } else {
            // Logic for Following
            Follow newFollow = Follow.builder()
                    .follower(follower)
                    .following(following)
                    .build();
            followRepository.save(newFollow);

            following.setFollowerCount(following.getFollowerCount() + 1);
            follower.setFollowingCount(follower.getFollowingCount() + 1);
        }

        // Persist updated counts to the database
        userRepository.save(following);
        userRepository.save(follower);
    }
}
