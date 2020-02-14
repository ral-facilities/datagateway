import React from 'react';
import { connect } from 'react-redux';
import { StateType } from '../state/app.types';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { format } from 'date-fns';
import { toggleRequestSent } from '../state/actions/actions';
import { ThunkDispatch } from 'redux-thunk';
import { Action, AnyAction } from 'redux';

interface SearchButtonStoreProps {
  searchText: string;
  dataset: boolean;
  datafile: boolean;
  investigation: boolean;
  startDate: MaterialUiPickersDate;
  endDate: MaterialUiPickersDate;
  requestSent: boolean;
}

interface SearchButtonDispatchProps {
  toggleRequestSent: (requestSent: boolean) => Action;
}

type SearchButtonCombinedProps = SearchButtonStoreProps &
  SearchButtonDispatchProps;

interface QueryParameters {
  text?: string;
  lower?: string;
  upper?: string;
  target: string;
}

interface RequestParameters {
  sessionId: string | null;
  maxCount: number;
}

type LuceneParameters = QueryParameters | RequestParameters;

class SearchButton extends React.Component<SearchButtonCombinedProps> {
  public constructor(props: SearchButtonCombinedProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.fetchLuceneResults = this.fetchLuceneResults.bind(this);
    this.urlParamsBuilder = this.urlParamsBuilder.bind(this);
  }

  public urlParamsBuilder = (datasearchtype: string): LuceneParameters => {
    // let stringStartDate = '0000001010000';
    let stringStartDate = '';
    if (this.props.startDate !== null) {
      stringStartDate = format(this.props.startDate, 'yyyy-MM-dd');
      let stringStartDateArray = stringStartDate.split('-');
      stringStartDate =
        stringStartDateArray[0] +
        stringStartDateArray[1] +
        stringStartDateArray[2] +
        '0000';
    }

    // let stringEndDate = '9000012312359';
    let stringEndDate = '';
    if (this.props.endDate !== null) {
      stringEndDate = format(this.props.endDate, 'yyyy-MM-dd');
      let stringEndDateArray = stringEndDate.split('-');
      stringEndDate =
        stringEndDateArray[0] +
        stringEndDateArray[1] +
        stringEndDateArray[2] +
        '2359';
    }

    let query: QueryParameters = {
      target: datasearchtype,
    };

    if (this.props.searchText.length > 0) {
      query.text = this.props.searchText;
    }

    if (stringStartDate.length > 0) {
      query.lower = stringStartDate;
    }

    if (stringEndDate.length > 0) {
      query.upper = stringEndDate;
    }

    const queryParams = {
      sessionId: window.localStorage.getItem('icat:token'),
      query,
      maxCount: 300,
    };
    return queryParams;
  };

  public handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (this.props.dataset === true) {
      let datasetParams = this.urlParamsBuilder('Dataset');
      this.fetchLuceneResults(datasetParams);
    }
    if (this.props.datafile === true) {
      let datafileParams = this.urlParamsBuilder('Datafile');
      this.fetchLuceneResults(datafileParams);
    }
    if (this.props.investigation === true) {
      let investigationParams = this.urlParamsBuilder('Investigation');
      this.fetchLuceneResults(investigationParams);
    }
  };

  public async fetchLuceneResults(
    queryParams: LuceneParameters
  ): Promise<void> {
    let requestSent = true;
    this.props.toggleRequestSent(requestSent);
    console.log(requestSent);
    const response = await axios.get(
      'https://scigateway-preprod.esc.rl.ac.uk:8181/icat/lucene/data',
      { params: queryParams }
    );
    const ids = response.data.map((x: { id: number; score: number }) => x.id);
    console.log(ids);
  }

  public render(): React.ReactNode {
    return (
      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={this.handleClick}
          aria-label="submit search button"
        >
          Search
        </Button>
      </div>
    );
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): SearchButtonDispatchProps => ({
  toggleRequestSent: (requestSent: boolean) =>
    dispatch(toggleRequestSent(requestSent)),
});

const mapStateToProps = (state: StateType): SearchButtonStoreProps => {
  return {
    searchText: state.dgsearch.searchText,
    dataset: state.dgsearch.checkBox.dataset,
    datafile: state.dgsearch.checkBox.datafile,
    investigation: state.dgsearch.checkBox.investigation,
    startDate: state.dgsearch.selectDate.startDate,
    endDate: state.dgsearch.selectDate.endDate,
    requestSent: state.dgsearch.requestSent,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchButton);
