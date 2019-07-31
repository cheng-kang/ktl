import * as _ from 'lodash';
import { State } from './*';

export function getCurrentProfile(state: State) {
  return (
    state.profiles.find(({ id }) => id === state.currentProfileId) || {
      id: 'default',
      context: '',
      namespace: '',
      pods: [],
    }
  );
}

export function getCurrentProfileId(state: State) {
  return state.currentProfileId || 'default';
}

export function getCurrentProfilePods(state: State) {
  return _.get(getCurrentProfile(state), 'pods', []);
}
