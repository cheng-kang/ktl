import { applyMiddleware, createStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import * as _ from 'lodash';

import { reducer } from './reducer';
import { persist } from '../persist';
import { State, Actions } from './redux';

const persistor = (store: Store<State | undefined>) => (next: any) => (action: Actions) => {
  const result = next(action);
  persist.set('store', store.getState());
  return result;
};

const configureStore = (initialState?: State): Store<State | undefined> => {
  const middlewares: any[] = [persistor];
  const enhancer = composeWithDevTools(applyMiddleware(...middlewares));
  return createStore<State | undefined, Actions, any, any>(reducer, initialState, enhancer);
};
const persistedStore = persist.get('store');
const initialState = _.isEmpty(persistedStore) ? undefined : (persistedStore as State);

const store = configureStore(initialState);

if (typeof module.hot !== 'undefined') {
  module.hot.accept('./reducer', () => store.replaceReducer(require('./reducer').reducer));
}

export { store };
