import React from 'react';
import { IndexRange } from 'react-virtualized';
import {
  fetchInvestigationCount,
  fetchInvestigations,
} from 'datagateway-common';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { StateType } from 'datagateway-common/lib/state/app.types';
import { connect } from 'react-redux';
import { Paper } from '@material-ui/core';

import CardView from './cardView.component';

interface InvestigationCVDispatchProps {
  fetchData: (
    getDatasetCount?: boolean,
    offsetParams?: IndexRange
  ) => Promise<void>;
  fetchCount: () => Promise<void>;
}

const InvestigationCardView = (
  props: InvestigationCVDispatchProps & {
    pageNum: number | null;
    // setPageQuery: (pageKey: string, pageValue: string) => void;
  }
): React.ReactElement => {
  const { fetchData, fetchCount, pageNum } = props; // fetchData, setPageQuery

  const [fetchedCount, setFetchedCount] = React.useState(false);
  const [fetchedData, setFetchedData] = React.useState(false);

  React.useEffect(() => {
    // Fetch count.
    if (!fetchedCount) {
      fetchCount();
      setFetchedCount(true);
    }

    // Fetch data.
    if (!fetchedData) {
      // TODO: The offsetParams (startIndex, stopIndex) needs to be
      //       changed for pagination when fetching data.
      fetchData();
      setFetchedData(true);
    }
  }, [fetchedData, fetchData, fetchedCount, fetchCount, setFetchedCount]);

  return (
    // Place table in Paper component which adjusts for the height
    // of the AppBar (64px) on parent application and the breadcrumbs component (31px).
    <Paper square>
      {/* TODO: Since CardView is a separate component, we should not couple the data from redux to it,
            and pass it through here. */}
      {/* TODO: Support for more simpler data types i.e. strings to directly passed or different ways 
            of passing data to the card view (how can we achieve this if the data is not Entity[]). */}
      {/* TODO: Add support for pagination here (?), card layout type (buttons), card widths, sort, filtering. */}
      <CardView
        title={{ dataKey: 'TITLE' }}
        description={{ dataKey: 'SUMMARY' }}
        furtherInformation={[
          {
            label: 'Start Date',
            dataKey: 'STARTDATE',
          },
          {
            label: 'End Date',
            dataKey: 'ENDDATE',
          },
          {
            label: 'DOI',
            dataKey: 'DOI',
          },
          {
            label: 'Visit ID',
            dataKey: 'VISIT_ID',
          },
          // {
          //   label: 'Dataset Count',
          //   dataKey: 'DATASET_COUNT',
          // },
        ]}
        // TODO: Handle via redux state.
        pageNum={pageNum}
        // setPageQuery={setPageQuery}
      />
    </Paper>
  );
};

// const mapStateToProps = (state: StateType)

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): InvestigationCVDispatchProps => ({
  fetchData: (getDatasetCount?: boolean, offsetParams?: IndexRange) =>
    dispatch(fetchInvestigations({ getDatasetCount, offsetParams })),
  fetchCount: () => dispatch(fetchInvestigationCount()),
});

export default connect(null, mapDispatchToProps)(InvestigationCardView);
