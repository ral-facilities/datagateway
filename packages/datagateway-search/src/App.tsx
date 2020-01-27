import React from 'react';
import './App.css';
import Header from './search/Header';
import * as log from 'loglevel';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import SelectDates from './search/datePicker';
import Checkboxes from './search/checkBoxes';
// import axios from 'axios';

import {
  createGenerateClassName,
  StylesProvider,
} from '@material-ui/core/styles';

const generateClassName = createGenerateClassName({
  productionPrefix: 'dgws',
  disableGlobal: true,
});

class App extends React.Component {
  public componentDidCatch(error: Error | null): void {
    this.setState({ hasError: true });
    log.error(`datagateway-search-plugin failed with error: ${error}`);
  }

  public handleClick(): void {
    console.log('test: button is pressed');
    // axios({
    //   url: 'https://dog.ceo/api/breeds/list/all',
    //   method: 'get'
    // })
    // ;(async () => {
    // const response = await axios.get('https://dog.ceo/api/breeds/list/all')
    // console.log(response)
    // })()
  }

  public render(): React.ReactElement {
    return (
      <div
        style={{
          padding: 15,
          margin: 10,
        }}
        className="App"
      >
        <StylesProvider generateClassName={generateClassName}>
          <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="flex-start"
          >
            <Grid item>
              <Header />
              <p> Fill out form and then click search. </p>
            </Grid>

            <Grid item>
              <TextField
                id="filled-search"
                label="Search Text"
                type="search"
                margin="normal"
              />
            </Grid>

            <Grid item>
              <SelectDates startOrEnd="Start Date" />
              <br></br>
              <SelectDates startOrEnd="End Date" />
            </Grid>

            <Grid item>
              <Checkboxes />
            </Grid>

            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleClick}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </StylesProvider>
      </div>
    );
  }
}

export default App;
