import React from 'react';
import { connect } from 'react-redux';
import { StateType } from '../state/app.types';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { format } from 'date-fns';
import {
  toggleLuceneRequestReceived,
  storeDatasetLucene,
  storeDatafileLucene,
  storeInvestigationLucene,
} from '../state/actions/actions';
import { ThunkDispatch } from 'redux-thunk';
import { Action, AnyAction } from 'redux';
import { readSciGatewayToken } from 'datagateway-common';

interface SearchButtonStoreProps {
  searchText: string;
  dataset: boolean;
  datafile: boolean;
  investigation: boolean;
  startDate: MaterialUiPickersDate;
  endDate: MaterialUiPickersDate;
  requestReceived: boolean;
  luceneDatafile: number[];
  luceneDataset: number[];
  luceneInvestigation: number[];
}

interface SearchButtonDispatchProps {
  toggleLuceneRequestReceived: (requestReceived: boolean) => Action;
  storeDatasetLucene: (luceneData: number[]) => Action;
  storeDatafileLucene: (luceneData: number[]) => Action;
  storeInvestigationLucene: (luceneData: number[]) => Action;
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

    // TODO add in readscigatewaytoken
    const queryParams = {
      sessionId: readSciGatewayToken().sessionId,
      query,
      maxCount: 300,
    };
    return queryParams;
  };

  public handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (this.props.dataset === true) {
      let datasetParams = this.urlParamsBuilder('Dataset');
      const luceneResults = await this.fetchLuceneResults(datasetParams);
      const luceneResultIds = luceneResults.map(result => result.id);
      this.props.storeDatasetLucene(luceneResultIds);

      this.props.toggleLuceneRequestReceived(true);
    }
    if (this.props.datafile === true) {
      let datafileParams = this.urlParamsBuilder('Datafile');
      const luceneResults = await this.fetchLuceneResults(datafileParams);
      const luceneResultIds = luceneResults.map(result => result.id);
      this.props.storeDatafileLucene(luceneResultIds);

      this.props.toggleLuceneRequestReceived(true);
    }
    if (this.props.investigation === true) {
      let investigationParams = this.urlParamsBuilder('Investigation');
      const luceneResults = await this.fetchLuceneResults(investigationParams);
      const luceneResultIds = luceneResults.map(result => result.id);
      this.props.storeInvestigationLucene(luceneResultIds);

      this.props.toggleLuceneRequestReceived(true);
    }
  };

  public async fetchLuceneResults(
    queryParams: LuceneParameters
  ): Promise<any[]> {
    const response = await axios.get(
      'https://scigateway-preprod.esc.rl.ac.uk:8181/icat/lucene/data',
      { params: queryParams }
    );
    return response.data;
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
  toggleLuceneRequestReceived: (requestReceived: boolean) =>
    dispatch(toggleLuceneRequestReceived(requestReceived)),
  storeDatasetLucene: (luceneData: number[]) =>
    dispatch(storeDatasetLucene(luceneData)),
  storeDatafileLucene: (luceneData: number[]) =>
    dispatch(storeDatafileLucene(luceneData)),
  storeInvestigationLucene: (luceneData: number[]) =>
    dispatch(storeInvestigationLucene(luceneData)),
});

const mapStateToProps = (state: StateType): SearchButtonStoreProps => {
  return {
    searchText: state.dgsearch.searchText,
    dataset: state.dgsearch.checkBox.dataset,
    datafile: state.dgsearch.checkBox.datafile,
    investigation: state.dgsearch.checkBox.investigation,
    startDate: state.dgsearch.selectDate.startDate,
    endDate: state.dgsearch.selectDate.endDate,
    requestReceived: state.dgsearch.requestReceived,
    luceneDataset: state.dgsearch.searchData.dataset,
    luceneDatafile: state.dgsearch.searchData.datafile,
    luceneInvestigation: state.dgsearch.searchData.investigation,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchButton);
