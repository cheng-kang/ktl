import { Action } from 'redux';

export interface Pod {
  context: string;
  namespace: string;
  name: string;

  localPort?: string;
  remotePort?: string;
}

export interface Profile {
  id: string;
  name: string;
  context: string;
  namespace: string;
  pods: Pod[];
}

export interface State {
  profiles: Profile[];
  currentProfileId: string;
}

export interface AddProfileAction extends Action {
  type: 'ADD_PROFILE';
  payload: string;
}

export interface RemoveProfileAction extends Action {
  type: 'REMOVE_PROFILE';
  payload: string;
}

export interface SetCurrentProfileIdAction extends Action {
  type: 'SET_CURRENT_PROFILE_ID';
  payload: string;
}

export interface UpdateProfileNameAction extends Action {
  type: 'UPDATE_PROFILE_NAME';
  payload: {
    id: string;
    name: string;
  };
}

export interface UpdateProfileContextAction extends Action {
  type: 'UPDATE_PROFILE_CONTEXT';
  payload: string;
}

export interface UpdateProfileNamespaceAction extends Action {
  type: 'UPDATE_PROFILE_NAMESPACE';
  payload: string;
}

export interface AddProfilePodAction extends Action {
  type: 'Add_PROFILE_POD';
  payload: Pod;
}

export interface RemoveProfilePodAction extends Action {
  type: 'REMOVE_PROFILE_POD';
  payload: Pod;
}

export interface UpdateProfilePodAction extends Action {
  type: 'UPDATE_PROFILE_POD';
  payload: Pod;
}

export type Actions =
  | AddProfileAction
  | RemoveProfileAction
  | SetCurrentProfileIdAction
  | UpdateProfileNameAction
  | UpdateProfileContextAction
  | UpdateProfileNamespaceAction
  | AddProfilePodAction
  | RemoveProfilePodAction
  | UpdateProfilePodAction;
