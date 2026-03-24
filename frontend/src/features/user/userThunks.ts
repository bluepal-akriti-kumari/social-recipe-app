import type { AppDispatch } from '../../store/store';
import { userService } from '../../services/user.service';
import { 
  fetchProfileStart, fetchProfileSuccess, fetchProfileFailure, 
  toggleFollow, updateProfileSuccess 
} from './userSlice';

export const getProfileThunk = (userId: number) => async (dispatch: AppDispatch) => {
  dispatch(fetchProfileStart());
  try {
    const data = await userService.getProfile(userId);
    dispatch(fetchProfileSuccess(data));
  } catch (err: any) {
    const message = err.response?.data?.error || err.response?.data || 'Failed to fetch profile';
    dispatch(fetchProfileFailure(typeof message === 'string' ? message : JSON.stringify(message)));
  }
};

export const followUserThunk = (userId: number) => async (dispatch: AppDispatch) => {
  dispatch(toggleFollow());
  try {
    await userService.followUser(userId);
  } catch (err: any) {
    dispatch(toggleFollow());
    console.error('Follow failed', err);
  }
};

export const unfollowUserThunk = (userId: number) => async (dispatch: AppDispatch) => {
  dispatch(toggleFollow());
  try {
    await userService.unfollowUser(userId);
  } catch (err: any) {
    dispatch(toggleFollow());
    console.error('Unfollow failed', err);
  }
};

export const updateProfileThunk = (data: { bio?: string; profilePictureUrl?: string; coverPictureUrl?: string }) => async (dispatch: AppDispatch) => {
  dispatch(fetchProfileStart());
  try {
    const updatedProfile = await userService.updateProfile(data);
    dispatch(updateProfileSuccess(updatedProfile));
  } catch (err: any) {
    const message = err.response?.data?.error || err.response?.data || 'Failed to update profile';
    dispatch(fetchProfileFailure(typeof message === 'string' ? message : JSON.stringify(message)));
    throw err;
  }
};
