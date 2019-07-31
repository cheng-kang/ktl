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
  context: string;
  namespace: string;
  pods: Pod[];
}

export interface State {
  profiles: Profile[];
  currentProfileId: string;
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
  | UpdateProfileContextAction
  | UpdateProfileNamespaceAction
  | AddProfilePodAction
  | RemoveProfilePodAction
  | UpdateProfilePodAction;
