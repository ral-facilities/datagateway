import Button from '@material-ui/core/Button';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { LuceneSearchParams } from 'datagateway-common';
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
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
  fetchLuceneInvestigations: (params: LuceneSearchParams) => Promise<void>;
  fetchLuceneDatasets: (params: LuceneSearchParams) => Promise<void>;
  fetchLuceneDatafiles: (params: LuceneSearchParams) => Promise<void>;

  setDatasetTab: (toggleOption: boolean) => Action;
  setDatafileTab: (toggleOption: boolean) => Action;
  setInvestigationTab: (toggleOption: boolean) => Action;
}

type SearchButtonCombinedProps = WithTranslation &
  SearchButtonStoreProps &
  SearchButtonDispatchProps;

class SearchButton extends React.Component<SearchButtonCombinedProps> {
  public constructor(props: SearchButtonCombinedProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  public handleClick = async (
    event: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    if (this.props.dataset === true) {
      // Fetch lucene datasets
      this.props.fetchLuceneDatasets({
        searchText: this.props.searchText,
        startDate: this.props.startDate,
        endDate: this.props.endDate,
      });
    }

    if (this.props.datafile === true) {
      // Fetch lucene datafiles
      this.props.fetchLuceneDatafiles({
        searchText: this.props.searchText,
        startDate: this.props.startDate,
        endDate: this.props.endDate,
      });
    }
    if (this.props.investigation === true) {
      // Fetch lucene investigations
      this.props.fetchLuceneInvestigations({
        searchText: this.props.searchText,
        startDate: this.props.startDate,
        endDate: this.props.endDate,
      });
    }

    // Set the appropriate tabs.
    this.props.setDatafileTab(this.props.datafile);
    this.props.setDatasetTab(this.props.dataset);
    this.props.setInvestigationTab(this.props.investigation);
  };

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

export const TranslatedSearchButton = withTranslation()(SearchButton);
TranslatedSearchButton.displayName = 'TranslatedSearchButton';

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TranslatedSearchButton);
