import api from './api';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  bio: string;
  profilePictureUrl: string;
  coverPictureUrl: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isVerified?: boolean;
  reputationPoints?: number;
  reputationLevel?: string;
}

export const userService = {
  getProfile: (username: string) => 
    api.get<UserProfile>(`/users/${username}`).then(r => r.data),
  
  followUser: (username: string) => 
    api.post(`/users/${username}/follow`).then(r => r.data),
  
  unfollowUser: (username: string) => 
    api.delete(`/users/${username}/unfollow`).then(r => r.data),
  
  updateProfile: (data: { bio?: string; profilePictureUrl?: string; coverPictureUrl?: string }) => 
    api.put<UserProfile>('/users/me', data).then(r => r.data),
};
