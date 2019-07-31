import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { AppContainer } from 'react-hot-loader';

import Application from './components/Application';
import { store } from './redux';
import * as shell from 'shelljs';

import './app.css';

shell.config.execPath = shell.which('node').toString();

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

render(Application);
