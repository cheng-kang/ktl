import { ActionCreator } from 'redux';
import {
  AddProfileAction,
  RemoveProfileAction,
  SetCurrentProfileIdAction,
  UpdateProfileNameAction,
  UpdateProfileContextAction,
  UpdateProfileNamespaceAction,
  AddProfilePodAction,
  UpdateProfilePodAction,
  RemoveProfilePodAction,
} from './*';
import * as shortid from 'shortid';

export const ADD_PROFILE = 'ADD_PROFILE';
export const REMOVE_PROFILE = 'REMOVE_PROFILE';
export const SET_CURRENT_PROFILE_ID = 'SET_CURRENT_PROFILE_ID';
export const UPDATE_PROFILE_NAME = 'UPDATE_PROFILE_NAME';

export const UPDATE_PROFILE_CONTEXT = 'UPDATE_PROFILE_CONTEXT';
export const UPDATE_PROFILE_NAMESPACE = 'UPDATE_PROFILE_NAMESPACE';
export const Add_PROFILE_POD = 'Add_PROFILE_POD';
export const REMOVE_PROFILE_POD = 'REMOVE_PROFILE_POD';
export const UPDATE_PROFILE_POD = 'UPDATE_PROFILE_POD';

export const addProfile: ActionCreator<AddProfileAction> = () => ({
  type: ADD_PROFILE,
  payload: shortid.generate(),
});

export const removeProfile: ActionCreator<RemoveProfileAction> = id => ({
  type: REMOVE_PROFILE,
  payload: id,
});

export const setCurrentProfileId: ActionCreator<SetCurrentProfileIdAction> = id => ({
  type: SET_CURRENT_PROFILE_ID,
  payload: id,
});

export const updateProfileName: ActionCreator<UpdateProfileNameAction> = (id, name) => ({
  type: UPDATE_PROFILE_NAME,
  payload: {
    id,
    name,
  },
});

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
