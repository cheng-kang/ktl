import { ActionCreator } from 'redux';
import {
  UpdateProfileContextAction,
  UpdateProfileNamespaceAction,
  AddProfilePodAction,
  UpdateProfilePodAction,
  RemoveProfilePodAction,
} from './*';

export const UPDATE_PROFILE_CONTEXT = 'UPDATE_PROFILE_CONTEXT';
export const UPDATE_PROFILE_NAMESPACE = 'UPDATE_PROFILE_NAMESPACE';
export const Add_PROFILE_POD = 'Add_PROFILE_POD';
export const REMOVE_PROFILE_POD = 'REMOVE_PROFILE_POD';
export const UPDATE_PROFILE_POD = 'UPDATE_PROFILE_POD';

export const updateProfileContext: ActionCreator<UpdateProfileContextAction> = context => ({
  type: UPDATE_PROFILE_CONTEXT,
  payload: context,
});

export const updateProfileNamespace: ActionCreator<UpdateProfileNamespaceAction> = context => ({
  type: UPDATE_PROFILE_NAMESPACE,
  payload: context,
});

export const addProfilePod: ActionCreator<AddProfilePodAction> = pod => ({
  type: Add_PROFILE_POD,
  payload: pod,
});

export const updateProfilePod: ActionCreator<UpdateProfilePodAction> = pod => ({
  type: UPDATE_PROFILE_POD,
  payload: pod,
});

export const removeProfilePod: ActionCreator<RemoveProfilePodAction> = pod => ({
  type: REMOVE_PROFILE_POD,
  payload: pod,
});
