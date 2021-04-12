import React from 'react';
import HomePage from './homePage/homePage.component';
import './App.css';
import * as log from 'loglevel';

class App extends React.Component {
  public componentDidCatch(error: Error | null): void {
    this.setState({ hasError: true });
    log.error(`datagateway-homepage failed with error: ${error}`);
  }

  render () {
    return (
      <div className="App">
        <HomePage />
      </div>
    );
  }
}

export default App;
