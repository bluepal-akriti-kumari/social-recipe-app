import api from './api';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  bio: string;
  profilePictureUrl: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export const userService = {
  getProfile: (username: string) => 
    api.get<UserProfile>(`/${username}`).then(r => r.data),
  
  followUser: (username: string) => 
    api.post(`/${username}/follow`).then(r => r.data),
  
  unfollowUser: (username: string) => 
    api.delete(`/${username}/unfollow`).then(r => r.data),
};
