import Button from '@material-ui/core/Button';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { LuceneSearchParams } from 'datagateway-common';
import React from 'react';
import { connect } from 'react-redux';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
  fetchLuceneDatafiles,
  fetchLuceneDatasets,
  fetchLuceneInvestigations,
  setDatafileTab,
  setDatasetTab,
  setInvestigationTab,
} from '../state/actions/actions';
import { StateType } from '../state/app.types';

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
  datafileTab: boolean;
  datasetTab: boolean;
  investigationTab: boolean;
  downloadApiUrl: string;
}

interface SearchButtonDispatchProps {
  // toggleLuceneRequestReceived: (requestReceived: boolean) => Action;
  // storeDatasetLucene: (luceneData: number[]) => Action;
  // storeDatafileLucene: (luceneData: number[]) => Action;
  // storeInvestigationLucene: (luceneData: number[]) => Action;
  fetchLuceneInvestigations: (params: LuceneSearchParams) => Promise<void>;
  fetchLuceneDatasets: (params: LuceneSearchParams) => Promise<void>;
  fetchLuceneDatafiles: (params: LuceneSearchParams) => Promise<void>;

  setDatasetTab: (toggleOption: boolean) => Action;
  setDatafileTab: (toggleOption: boolean) => Action;
  setInvestigationTab: (toggleOption: boolean) => Action;
}

type SearchButtonCombinedProps = SearchButtonStoreProps &
  SearchButtonDispatchProps;

// interface QueryParameters {
//   text?: string;
//   lower?: string;
//   upper?: string;
//   target: string;
// }

// interface RequestParameters {
//   sessionId: string | null;
//   maxCount: number;
// }

// type LuceneParameters = QueryParameters | RequestParameters;

class SearchButton extends React.Component<SearchButtonCombinedProps> {
  public constructor(props: SearchButtonCombinedProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    // this.fetchLuceneResults = this.fetchLuceneResults.bind(this);
    // this.urlParamsBuilder = this.urlParamsBuilder.bind(this);
  }

  // public urlParamsBuilder = (datasearchtype: string): LuceneParameters => {
  //   let stringStartDate = '';
  //   if (this.props.startDate !== null) {
  //     stringStartDate = format(this.props.startDate, 'yyyy-MM-dd');
  //     const stringStartDateArray = stringStartDate.split('-');
  //     stringStartDate =
  //       stringStartDateArray[0] +
  //       stringStartDateArray[1] +
  //       stringStartDateArray[2] +
  //       '0000';
  //   }

  //   let stringEndDate = '';
  //   if (this.props.endDate !== null) {
  //     stringEndDate = format(this.props.endDate, 'yyyy-MM-dd');
  //     const stringEndDateArray = stringEndDate.split('-');
  //     stringEndDate =
  //       stringEndDateArray[0] +
  //       stringEndDateArray[1] +
  //       stringEndDateArray[2] +
  //       '2359';
  //   }

  //   const query: QueryParameters = {
  //     target: datasearchtype,
  //   };

  //   if (this.props.searchText.length > 0) {
  //     query.text = this.props.searchText;
  //   }

  //   if (stringStartDate.length > 0) {
  //     query.lower = stringStartDate;
  //   }

  //   if (stringEndDate.length > 0) {
  //     query.upper = stringEndDate;
  //   }

  //   const queryParams = {
  //     sessionId: readSciGatewayToken().sessionId,
  //     query,
  //     maxCount: 300,
  //   };

  //   return queryParams;
  // };

  // TODO: Handles search call to Lucene.
  public handleClick = async (
    event: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    if (this.props.dataset === true) {
      // const datasetParams = this.urlParamsBuilder('Dataset');
      // const luceneResults = await this.fetchLuceneResults(datasetParams);
      // const luceneResultIds = luceneResults.map((result) => result.id);
      // this.props.storeDatasetLucene(luceneResultIds);
      // this.props.toggleLuceneRequestReceived(true);

      // Fetch lucene datasets
      this.props.fetchLuceneDatasets({
        searchText: this.props.searchText,
        startDate: this.props.startDate,
        endDate: this.props.endDate,
      });
    }

    if (this.props.datafile === true) {
      // const datafileParams = this.urlParamsBuilder('Datafile');
      // const luceneResults = await this.fetchLuceneResults(datafileParams);
      // const luceneResultIds = luceneResults.map((result) => result.id);
      // this.props.storeDatafileLucene(luceneResultIds);
      // this.props.toggleLuceneRequestReceived(true);

      // Fetch lucene datafiles
      this.props.fetchLuceneDatafiles({
        searchText: this.props.searchText,
        startDate: this.props.startDate,
        endDate: this.props.endDate,
      });
    }
    if (this.props.investigation === true) {
      // const investigationParams = this.urlParamsBuilder('Investigation');
      // const luceneResults = await this.fetchLuceneResults(investigationParams);
      // const luceneResultIds = luceneResults.map((result) => result.id);
      // this.props.storeInvestigationLucene(luceneResultIds);
      // this.props.toggleLuceneRequestReceived(true);

      // Fetch lucene investigations
      this.props.fetchLuceneInvestigations({
        searchText: this.props.searchText,
        startDate: this.props.startDate,
        endDate: this.props.endDate,
      });
    }

    // Set the appropriate tabs.
    this.props.setDatasetTab(this.props.dataset);
    this.props.setDatafileTab(this.props.datafile);
    this.props.setInvestigationTab(this.props.investigation);
  };

  // public async fetchLuceneResults(
  //   queryParams: LuceneParameters
  //   // eslint-disable-next-line
  // ): Promise<any[]> {
  //   const splitUrl = this.props.downloadApiUrl.split('/');
  //   const icatUrl = `${splitUrl.slice(0, splitUrl.length - 1).join('/')}/icat`;
  //   const response = await axios.get(`${icatUrl}/lucene/data`, {
  //     params: queryParams,
  //   });
  //   return response.data;
  // }

  public render(): React.ReactNode {
    return (
      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={this.handleClick}
          aria-label="submit search button"
          size="large"
          fullWidth={true}
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
  // TODO: These can be moved out.
  // toggleLuceneRequestReceived: (requestReceived: boolean) =>
  //   dispatch(toggleLuceneRequestReceived(requestReceived)),
  // storeDatasetLucene: (luceneData: number[]) =>
  //   dispatch(storeDatasetLucene(luceneData)),
  // storeDatafileLucene: (luceneData: number[]) =>
  //   dispatch(storeDatafileLucene(luceneData)),
  // storeInvestigationLucene: (luceneData: number[]) =>
  //   dispatch(storeInvestigationLucene(luceneData)),
  fetchLuceneInvestigations: (params: LuceneSearchParams) =>
    dispatch(fetchLuceneInvestigations(params)),
  fetchLuceneDatasets: (params: LuceneSearchParams) =>
    dispatch(fetchLuceneDatasets(params)),
  fetchLuceneDatafiles: (params: LuceneSearchParams) =>
    dispatch(fetchLuceneDatafiles(params)),

  setDatasetTab: (toggleOption: boolean) =>
    dispatch(setDatasetTab(toggleOption)),
  setDatafileTab: (toggleOption: boolean) =>
    dispatch(setDatafileTab(toggleOption)),
  setInvestigationTab: (toggleOption: boolean) =>
    dispatch(setInvestigationTab(toggleOption)),
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
    datafileTab: state.dgsearch.tabs.datafileTab,
    datasetTab: state.dgsearch.tabs.datasetTab,
    investigationTab: state.dgsearch.tabs.investigationTab,
    downloadApiUrl: state.dgcommon.urls.downloadApiUrl,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchButton);
