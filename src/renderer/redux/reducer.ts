import { Reducer } from 'redux';
import * as _ from 'lodash';

import * as actions from './actions';
import { State, Pod, Actions } from './*';
import { getCurrentProfileId } from './selectors';

const defaultState: State = {
  profiles: [
    {
      id: 'default',
      namespace: '',
      context: '',
      pods: [],
    },
  ],
  currentProfileId: 'default',
};

export const reducer: Reducer<State, Actions> = (state = defaultState, action: Actions) => {
  const currentProfileId = getCurrentProfileId(state);

  if (!currentProfileId) {
    throw new Error('Missing currentProfileId.');
  }

  // TODO: what if cannot find? profileIdx === -1
  const profileIdx = state.profiles.findIndex(({ id }) => id === currentProfileId);

  if (profileIdx === -1) {
    throw new Error(`Profile ${currentProfileId} not found.`);
  }

  switch (action.type) {
    case actions.UPDATE_PROFILE_CONTEXT:
      return _.cloneDeep(_.set(state, `profiles[${profileIdx}].context`, action.payload));
    case actions.UPDATE_PROFILE_NAMESPACE:
      return _.cloneDeep(_.set(state, `profiles[${profileIdx}].namespace`, action.payload));
    case actions.Add_PROFILE_POD: {
      const pods = _.get(state, `profiles[${profileIdx}].pods`, []);
      return _.cloneDeep(_.set(state, `profiles[${profileIdx}].pods`, [...pods, action.payload]));
    }
    case actions.REMOVE_PROFILE_POD: {
      const pods = _.get(state, `profiles[${profileIdx}].pods`, []) as Pod[];
      return _.cloneDeep(
        _.set(state, `profiles[${profileIdx}].pods`, pods.filter(pod => !_.isEqual(pod, action.payload))),
      );
    }
    case actions.UPDATE_PROFILE_POD: {
      const pods = _.get(state, `profiles[${profileIdx}].pods`, []) as Pod[];
      const podIdx = pods.findIndex(
        ({ context, namespace, name }) =>
          context === action.payload.context && namespace === action.payload.namespace && name === action.payload.name,
      );

      if (podIdx === -1) {
        return state;
      }

      return _.cloneDeep(
        _.set(state, `profiles[${profileIdx}].pods[${podIdx}]`, _.merge(pods[podIdx], action.payload)),
      );
    }
    default:
      return state;
  }
};
