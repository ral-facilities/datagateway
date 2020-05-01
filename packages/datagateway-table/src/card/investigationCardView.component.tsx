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
  fetchData: (offsetParams?: IndexRange) => Promise<void>;
  fetchCount: () => Promise<void>;
}

const InvestigationCardView = (
  props: InvestigationCVDispatchProps & {
    pageNum: number | null;
    setPageQuery: (pageKey: string, pageValue: string) => void;
  }
): React.ReactElement => {
  const { fetchData, fetchCount, pageNum, setPageQuery } = props; // fetchData,

  const [fetchedData, setFetchedData] = React.useState(false);
  const [fetchedCount, setFetchedCount] = React.useState(false);

  React.useEffect(() => {
    // Fetch count.
    if (!fetchedCount) {
      fetchCount();
      setFetchedCount(true);
    }

    // Fetch data.
    if (!fetchedData) {
      fetchData();
      setFetchedData(true);
    }
  }, [fetchedData, fetchData, fetchedCount, fetchCount, setFetchedCount]);

  return (
    // Place table in Paper component which adjusts for the height
    // of the AppBar (64px) on parent application and the breadcrumbs component (31px).
    <Paper square>
      <CardView
        title={{ dataKey: 'TITLE' }}
        description={{ dataKey: 'SUMMARY' }}
        // TODO: Handle via redux state.
        pageNum={pageNum}
        setPageQuery={setPageQuery}
      />
    </Paper>
  );
};

// const mapStateToProps = (state: StateType)

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): InvestigationCVDispatchProps => ({
  fetchData: (offsetParams?: IndexRange) =>
    dispatch(fetchInvestigations({ offsetParams })),
  fetchCount: () => dispatch(fetchInvestigationCount()),
});

export default connect(null, mapDispatchToProps)(InvestigationCardView);
