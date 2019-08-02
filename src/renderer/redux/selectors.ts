import * as _ from 'lodash';
import { State } from './redux';

export function getCurrentProfile(state: State) {
  return (
    state.profiles.find(({ id }) => id === state.currentProfileId) || {
      id: 'default',
      name: 'default',
      context: '',
      namespace: '',
      services: [],
    }
  );
}

export function getCurrentProfileId(state: State) {
  return state.currentProfileId || 'default';
}

export function getCurrentProfileServices(state: State) {
  return _.get(getCurrentProfile(state), 'services', []);
}

export function getProfileIds(state: State) {
  return state.profiles.map(({ id }) => id);
}

export function getProfile(state: State, id: string) {
  return state.profiles.find(profile => profile.id === id);
}
