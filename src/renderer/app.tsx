import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { AppContainer } from 'react-hot-loader';
import * as qs from 'query-string';

import Application from './components/Application';
import { store } from './redux';

import './app.css';
import PodsWindow from './components/PodsWindow';

// Create main element
const mainElement = document.createElement('div');
mainElement.className = 'root';
document.body.appendChild(mainElement);

// Render components
const render = (Component: () => JSX.Element) => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <Component />
      </Provider>
    </AppContainer>,
    mainElement,
  );
};

render(() => {
  const { win } = qs.parse(window.location.search);

  if (win === 'pods') {
    return <PodsWindow />;
  }

  return <Application />;
});
