import { Action } from 'redux';
import { Profile, Service } from '../types/*';

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

export interface AddProfileServiceAction extends Action {
  type: 'Add_PROFILE_POD';
  payload: Service;
}

export interface RemoveProfileServiceAction extends Action {
  type: 'REMOVE_PROFILE_POD';
  payload: Service;
}

export interface UpdateProfileServiceAction extends Action {
  type: 'UPDATE_PROFILE_POD';
  payload: Service;
}

export type Actions =
  | AddProfileAction
  | RemoveProfileAction
  | SetCurrentProfileIdAction
  | UpdateProfileNameAction
  | UpdateProfileContextAction
  | UpdateProfileNamespaceAction
  | AddProfileServiceAction
  | RemoveProfileServiceAction
  | UpdateProfileServiceAction;
