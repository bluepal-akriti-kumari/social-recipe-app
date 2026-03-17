package com.bluepal.service.interfaces;

import com.bluepal.dto.response.UserProfileResponse;

public interface UserService {
    UserProfileResponse getUserProfile(String username, String currentUsername);
    void followUser(String followerUsername, String followingUsername);
    void unfollowUser(String followerUsername, String followingUsername);
    UserProfileResponse updateProfile(String username, com.bluepal.dto.request.UpdateProfileRequest request);
    void updateReputation(String username, int points);
    // Added for Toggle Logic
    void toggleFollow(String followerUsername, String followingUsername);
}