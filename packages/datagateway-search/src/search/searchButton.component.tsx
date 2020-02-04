import React from 'react';
import { connect } from 'react-redux';
import { StateType } from '../state/app.types';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { format } from 'date-fns';
// import {
//   TextColumnFilter,
//   Table,
//   formatBytes,
//   Order,
//   Filter,
//   Entity,
//   Datafile,
//   TableActionProps,
//   DateColumnFilter,
//   DownloadCartItem,
// } from 'datagateway-common';

interface SearchButtonStoreProps {
  searchText: string;
  dataset: boolean;
  datafile: boolean;
  investigation: boolean;
  startDate: MaterialUiPickersDate;
  endDate: MaterialUiPickersDate;
}

interface QueryParameters {
  text?: string;
  lower?: string;
  upper?: string;
  target: string;
}

interface RequestParameters {
  sessionId: string;
  maxCount: number;
}

type LuceneParameters = QueryParameters | RequestParameters;

type SearchButtonCombinedProps = SearchButtonStoreProps;

class SearchButton extends React.Component<SearchButtonCombinedProps> {
  public constructor(props: SearchButtonCombinedProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.luceneRequest = this.luceneRequest.bind(this);
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
      sessionId: 'ac7382f9-daa2-46f4-96f3-524f2342b074',
      query,
      maxCount: 300,
    };
    return queryParams;
  };

  public handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (this.props.dataset === true) {
      let datasetParams = this.urlParamsBuilder('Dataset');
      this.luceneRequest(datasetParams);
    }
    if (this.props.datafile === true) {
      let datafileParams = this.urlParamsBuilder('Datafile');
      this.luceneRequest(datafileParams);
    }
    if (this.props.investigation === true) {
      let investigationParams = this.urlParamsBuilder('Investigation');
      this.luceneRequest(investigationParams);
    }
  };

  public async luceneRequest(queryParams: LuceneParameters): Promise<void> {
    const response = await axios.get(
      'https://scigateway-preprod.esc.rl.ac.uk:8181/icat/lucene/data',
      { params: queryParams }
    );

    const ids = response.data.map((x: { id: number; score: number }) => x.id);
    console.log(ids);
  }

  //  Louise does this already, find her work
  //  public async apiRequest

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

const mapStateToProps = (state: StateType): SearchButtonStoreProps => {
  return {
    searchText: state.dgsearch.searchText,
    dataset: state.dgsearch.checkBox.dataset,
    datafile: state.dgsearch.checkBox.datafile,
    investigation: state.dgsearch.checkBox.investigation,
    startDate: state.dgsearch.selectDate.startDate,
    endDate: state.dgsearch.selectDate.endDate,
  };
};

export default connect(mapStateToProps)(SearchButton);
