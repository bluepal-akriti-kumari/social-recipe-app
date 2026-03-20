package com.bluepal.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String username;
    private String bio;
    private String profilePictureUrl;
    private String coverPictureUrl;
    private Integer followerCount;
    private Integer followingCount;
    private Boolean isFollowing;
    private Boolean isVerified;
    private Integer reputationPoints;
    private String reputationLevel;
    private Integer recipeCount;
}
