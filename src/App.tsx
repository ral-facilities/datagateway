import React from 'react';
import './App.css';
import * as log from 'loglevel';

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
          <div
            style={{
              padding: 20,
              background: 'green',
              color: 'white',
              margin: 5,
            }}
          >
            datagateway-table
          </div>
        </div>
      );
  }
}

export default App;
