import { Reducer } from 'redux';
import * as _ from 'lodash';

import * as actions from './actions';
import { State, Actions } from './redux';
import { getCurrentProfileId } from './selectors';
import { Service } from '../types/*';

const defaultState: State = {
  profiles: [
    {
      id: 'default',
      name: 'default',
      namespace: '',
      context: '',
      services: [],
    },
  ],
  currentProfileId: 'default',
};

export const reducer: Reducer<State | undefined, Actions> = (state = defaultState, action: Actions) => {
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
      _.set(state, `profiles[${profileIdx}].context`, action.payload);
      return _.cloneDeep(state);
    case actions.UPDATE_PROFILE_NAMESPACE:
      _.set(state, `profiles[${profileIdx}].namespace`, action.payload);
      return _.cloneDeep(state);
    case actions.Add_PROFILE_POD: {
      const services = _.get(state, `profiles[${profileIdx}].services`, []);
      _.set(state, `profiles[${profileIdx}].services`, [...services, action.payload]);
      return _.cloneDeep(state);
    }
    case actions.REMOVE_PROFILE_POD: {
      const services = _.get(state, `profiles[${profileIdx}].services`, []) as Service[];

      _.set(state, `profiles[${profileIdx}].services`, services.filter(service => !_.isEqual(service, action.payload)));
      return _.cloneDeep(state);
    }
    case actions.UPDATE_PROFILE_POD: {
      const services = _.get(state, `profiles[${profileIdx}].services`, []) as Service[];
      const serviceIdx = services.findIndex(
        ({ context, namespace, name }) =>
          context === action.payload.context && namespace === action.payload.namespace && name === action.payload.name,
      );

      if (serviceIdx === -1) {
        return state;
      }

      _.set(state, `profiles[${profileIdx}].services[${serviceIdx}]`, _.merge(services[serviceIdx], action.payload));
      return _.cloneDeep(state);
    }
    case actions.ADD_PROFILE:
      state.profiles = [
        ...state.profiles,
        { id: action.payload, name: action.payload, context: '', namespace: '', services: [] },
      ];
      state.currentProfileId = action.payload;
      return _.cloneDeep(state);
    case actions.REMOVE_PROFILE:
      if (state.profiles.length === 1) {
        return;
      }

      const idx = state.profiles.findIndex(({ id }) => id === action.payload);

      if (idx === -1) {
        return state;
      }

      let currentProfileId = state.currentProfileId;
      if (action.payload === state.currentProfileId) {
        if (idx === 0) {
          currentProfileId = state.profiles[1].id;
        }
        if (idx > 0) {
          currentProfileId = state.profiles[idx - 1].id;
        }
      }

      state.currentProfileId = currentProfileId;
      state.profiles.splice(idx, 1);

      return _.cloneDeep(state);
    case actions.SET_CURRENT_PROFILE_ID:
      _.set(state, 'currentProfileId', action.payload);
      return _.cloneDeep(state);
    case actions.UPDATE_PROFILE_NAME: {
      const { id, name } = action.payload;
      const idx = state.profiles.findIndex(profile => id === profile.id);

      if (idx === -1) {
        return state;
      }

      state.profiles[idx].name = name;

      return _.cloneDeep(state);
    }
    default:
      return state;
  }
};
