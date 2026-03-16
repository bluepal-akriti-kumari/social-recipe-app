import type { AppDispatch } from '../../store/store';
import { userService } from '../../services/user.service';
import { 
  fetchProfileStart, fetchProfileSuccess, fetchProfileFailure, 
  toggleFollow 
} from './userSlice';

export const getProfileThunk = (username: string) => async (dispatch: AppDispatch) => {
  dispatch(fetchProfileStart());
  try {
    const data = await userService.getProfile(username);
    dispatch(fetchProfileSuccess(data));
  } catch (err: any) {
    dispatch(fetchProfileFailure(err.response?.data || 'Failed to fetch profile'));
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
