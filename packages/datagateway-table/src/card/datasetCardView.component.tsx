import React from 'react';
import { Paper } from '@material-ui/core';

import CardView from './cardView.component';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from 'datagateway-common/lib/state/app.types';
import { AnyAction } from 'redux';
import { IndexRange } from 'react-virtualized';
import { fetchDatasets, fetchDatasetCount } from 'datagateway-common';
import { connect } from 'react-redux';

interface DatasetCVDispatchProps {
  fetchData: (
    investigationId: number,
    offsetParams?: IndexRange
  ) => Promise<void>;
  fetchCount: (investigationId: number) => Promise<void>;

  // addToCart: (entityIds: number[]) => Promise<void>;
  // removeFromCart: (entityIds: number[]) => Promise<void>;
}

interface DatasetCardViewProps {
  investigationId: string;

  // TODO: Should be in redux state.
  pageNum: number | null;
  setPageQuery: (pageKey: string, pageValue: string) => void;
}

type DatasetCVCombinedProps = DatasetCardViewProps & DatasetCVDispatchProps;

const DatasetCardView = (props: DatasetCVCombinedProps): React.ReactElement => {
  const { investigationId, fetchCount, pageNum, setPageQuery } = props;

  const [fetchedCount, setFetchedCount] = React.useState(false);

  React.useEffect(() => {
    if (!fetchedCount) {
      fetchCount(parseInt(investigationId));
      setFetchedCount(true);
    }
  }, [investigationId, fetchedCount, fetchCount]);

  return (
    <Paper square>
      <CardView
        // TODO: Put in the correct dataKeys.
        //       Provide an array of further info and tags.
        title={{ dataKey: 'TITLE' }}
        description={{ dataKey: 'SUMMARY' }}
        // TODO: Needs to handled by redux state.
        pageNum={pageNum}
        setPageQuery={setPageQuery}
      />
    </Paper>
  );
};

// const mapStateToProps = (state: StateType)

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): DatasetCVDispatchProps => ({
  fetchData: (investigationId: number, offsetParams?: IndexRange) =>
    dispatch(fetchDatasets({ investigationId, offsetParams })),
  fetchCount: (investigationId: number) =>
    dispatch(fetchDatasetCount(investigationId)),

  // addToCart: (entityIds: number[]) => dispatch(addToCart('dataset', entityIds)),
  // removeFromCart: (entityIds: number[]) => dispatch(removeFromCart('dataset', entityIds)),
});

export default connect(null, mapDispatchToProps)(DatasetCardView);
