import React from 'react';
import './App.css';
import Header from './search/Header';
import * as log from 'loglevel';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import SelectDates from './search/datePicker';
import CheckboxesGroup from './search/checkBoxes';
import axios from 'axios';
import { Provider } from 'react-redux';
import store from './store';

// const initialState = {
//   toggleCheckBox : [{
//     Dataset: true,
//     Datafile: true,
//     Investigation: true
//   }],
//   dates: [{
//   startDate: '2010/08/10',
//   endDate: '2019/8/10',  // TODO set end date to retrieve current date
//   }],
//   searchText: ''
// }

class App extends React.Component {
  public componentDidCatch(error: Error | null): void {
    log.error(`datagateway-search-plugin failed with error: ${error}`);
  }

  public async handleClick(): Promise<void> {
    const sessionId = window.localStorage.getItem('icat:token');
    console.log(window.localStorage.getItem('icat:token'));
    let requestURL = `https://scigateway-preprod.esc.rl.ac.uk:8181/icat/lucene/data?sessionId=${sessionId}&query=%7B"text":"h","target":"Investigation"%7D&maxCount=300`;
    const response = await axios.get(requestURL);
    console.log(response.data);
  }

  public render(): React.ReactNode {
    return (
      <Provider store={store}>
        <div
          style={{
            padding: 15,
            margin: 10,
          }}
          className="App"
        >
          <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="flex-start"
          >
            <Grid item>
              <Header />
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
              <CheckboxesGroup />
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
        </div>
      </Provider>
    );
  }
}

export default App;
