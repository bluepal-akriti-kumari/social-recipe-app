import type { AppDispatch } from '../../store/store';
import { userService } from '../../services/user.service';
import { 
  fetchProfileStart, fetchProfileSuccess, fetchProfileFailure, 
  toggleFollow, updateProfileSuccess 
} from './userSlice';

export const getProfileThunk = (username: string) => async (dispatch: AppDispatch) => {
  dispatch(fetchProfileStart());
  try {
    const data = await userService.getProfile(username);
    dispatch(fetchProfileSuccess(data));
  } catch (err: any) {
    const message = err.response?.data?.error || err.response?.data || 'Failed to fetch profile';
    dispatch(fetchProfileFailure(typeof message === 'string' ? message : JSON.stringify(message)));
  }
};

export const followUserThunk = (username: string) => async (dispatch: AppDispatch) => {
  dispatch(toggleFollow());
  try {
    await userService.followUser(username);
  } catch (err: any) {
    dispatch(toggleFollow());
    console.error('Follow failed', err);
  }
};

export const unfollowUserThunk = (username: string) => async (dispatch: AppDispatch) => {
  dispatch(toggleFollow());
  try {
    await userService.unfollowUser(username);
  } catch (err: any) {
    dispatch(toggleFollow());
    console.error('Unfollow failed', err);
  }
};

export const updateProfileThunk = (data: { bio?: string; profilePictureUrl?: string }) => async (dispatch: AppDispatch) => {
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
