import React from 'react';
import { connect } from 'react-redux';
import { StateType } from '../state/app.types';
import Button from '@material-ui/core/Button';
import axios from 'axios';

interface SearchButtonStoreProps {
  dataset: boolean;
  datafile: boolean;
  investigation: boolean;
}

type SearchButtonCombinedProps = SearchButtonStoreProps;

class SearchButton extends React.Component<SearchButtonCombinedProps> {
  constructor(props: SearchButtonCombinedProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
  }

  // const handleURL
  handleClick(event: any) {
    if (this.props.dataset === true) {
      // search w dataset query
      console.log('searched datasets');
    }
    if (this.props.datafile === true) {
      // search w dataset query
      console.log('searched datafiles');
    }
    if (this.props.investigation === true) {
      // search w dataset query
      console.log('searched investigations');
    }
    this.sendRequest();
  }

  public async sendRequest(): Promise<void> {
    // const hello = this.state.dataset

    // console.log(this.state.dgsearch.checkBox.dataset)

    const sessionId = window.localStorage.getItem('icat:token');
    console.log(window.localStorage.getItem('icat:token'));
    let requestURL = `https://scigateway-preprod.esc.rl.ac.uk:8181/icat/lucene/data?sessionId=${sessionId}&query=%7B"text":"h","target":"Investigation"%7D&maxCount=300`;
    const response = await axios.get(requestURL);
    console.log(response.data);
  }

  public render(): React.ReactNode {
    const { dataset } = this.props;
    return (
      <div>
        <Button variant="contained" color="primary" onClick={this.handleClick}>
          Search
        </Button>
      </div>
    );
  }
}

const mapStateToProps = (state: StateType): SearchButtonStoreProps => {
  return {
    dataset: state.dgsearch.checkBox.dataset,
    datafile: state.dgsearch.checkBox.datafile,
    investigation: state.dgsearch.checkBox.investigation,
  };
};

export default connect(mapStateToProps)(SearchButton);
