import React from 'react';
import './App.css';
import * as log from 'loglevel';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
import AppReducer from './state/reducers/app.reducer';
import { Provider } from 'react-redux';
import ExampleComponent from './example.component';
import { createLogger } from 'redux-logger';

const middleware = [thunk];

if (process.env.NODE_ENV === `development`) {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const logger = (createLogger as any)();
  middleware.push(logger);
}

/* eslint-disable no-underscore-dangle, @typescript-eslint/no-explicit-any */
const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable */

const store = createStore(
  AppReducer(),
  composeEnhancers(applyMiddleware(...middleware))
);

class App extends React.Component<{}, { hasError: boolean }> {
  public constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
  }

  public componentDidCatch(error: Error | null): void {
    this.setState({ hasError: true });
    log.error(`demo_plugin failed with error: ${error}`);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error">
          <div
            style={{
              padding: 20,
              background: 'red',
              color: 'white',
              margin: 5,
            }}
          >
            Something went wrong...
          </div>
        </div>
      );
    } else
      return (
        <div className="App">
          <Provider store={store}>
            <ExampleComponent />
          </Provider>
        </div>
      );
  }
}

export default App;
