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
  setDatasetTab,
  setDatafileTab,
  setInvestigationTab,
} from '../state/actions/actions';
import { ThunkDispatch } from 'redux-thunk';
import { Action, AnyAction } from 'redux';
import { readSciGatewayToken } from 'datagateway-common';
import { withTranslation, WithTranslation } from 'react-i18next';

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
  toggleLuceneRequestReceived: (requestReceived: boolean) => Action;
  storeDatasetLucene: (luceneData: number[]) => Action;
  storeDatafileLucene: (luceneData: number[]) => Action;
  storeInvestigationLucene: (luceneData: number[]) => Action;
  setDatasetTab: (toggleOption: boolean) => Action;
  setDatafileTab: (toggleOption: boolean) => Action;
  setInvestigationTab: (toggleOption: boolean) => Action;
}

type SearchButtonCombinedProps = WithTranslation &
  SearchButtonStoreProps &
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
    let stringStartDate =
      this.props.startDate !== null
        ? format(this.props.startDate, 'yyyy-MM-dd')
        : '00000-01-01';
    const stringStartDateArray = stringStartDate.split('-');
    stringStartDate =
      stringStartDateArray[0] +
      stringStartDateArray[1] +
      stringStartDateArray[2] +
      '0000';

    let stringEndDate =
      this.props.endDate !== null
        ? format(this.props.endDate, 'yyyy-MM-dd')
        : '90000-12-31';
    const stringEndDateArray = stringEndDate.split('-');
    stringEndDate =
      stringEndDateArray[0] +
      stringEndDateArray[1] +
      stringEndDateArray[2] +
      '2359';

    const query: QueryParameters = {
      target: datasearchtype,
    };

    if (this.props.searchText.length > 0) {
      query.text = this.props.searchText;
    }
    query.lower = stringStartDate;
    query.upper = stringEndDate;

    const queryParams = {
      sessionId: readSciGatewayToken().sessionId,
      query,
      maxCount: 300,
    };

    return queryParams;
  };

  public handleClick = async (
    event: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    if (this.props.dataset === true) {
      const datasetParams = this.urlParamsBuilder('Dataset');
      const luceneResults = await this.fetchLuceneResults(datasetParams);
      const luceneResultIds = luceneResults.map((result) => result.id);
      this.props.storeDatasetLucene(luceneResultIds);

      this.props.toggleLuceneRequestReceived(true);
    }
    if (this.props.datafile === true) {
      const datafileParams = this.urlParamsBuilder('Datafile');
      const luceneResults = await this.fetchLuceneResults(datafileParams);
      const luceneResultIds = luceneResults.map((result) => result.id);
      this.props.storeDatafileLucene(luceneResultIds);

      this.props.toggleLuceneRequestReceived(true);
    }
    if (this.props.investigation === true) {
      const investigationParams = this.urlParamsBuilder('Investigation');
      const luceneResults = await this.fetchLuceneResults(investigationParams);
      const luceneResultIds = luceneResults.map((result) => result.id);
      this.props.storeInvestigationLucene(luceneResultIds);

      this.props.toggleLuceneRequestReceived(true);
    }

    this.props.setDatasetTab(this.props.dataset);
    this.props.setDatafileTab(this.props.datafile);
    this.props.setInvestigationTab(this.props.investigation);
  };

  public async fetchLuceneResults(
    queryParams: LuceneParameters
    // eslint-disable-next-line
  ): Promise<any[]> {
    const splitUrl = this.props.downloadApiUrl.split('/');
    const icatUrl = `${splitUrl.slice(0, splitUrl.length - 1).join('/')}/icat`;
    const response = await axios.get(`${icatUrl}/lucene/data`, {
      params: queryParams,
    });
    return response.data;
  }

  public render(): React.ReactNode {
    return (
      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={this.handleClick}
          aria-label={this.props.t('searchBox.search_button_arialabel')}
          size="large"
          fullWidth={true}
        >
          {this.props.t('searchBox.search_button')}
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

export const TranslatedSearchButton = withTranslation()(SearchButton);
TranslatedSearchButton.displayName = 'TranslatedSearchButton';

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TranslatedSearchButton);
