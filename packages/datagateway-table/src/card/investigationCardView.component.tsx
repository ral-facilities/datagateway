import React from 'react';
import { IndexRange } from 'react-virtualized';
import {
  fetchInvestigationCount,
  fetchInvestigations,
  Investigation,
  investigationLink,
  // Entity,
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

// interface InvestigationCVStateProps {
//   data: Entity[];
//   totalDataCount: number;
// }

type InvestigationCVCombinedProps = InvestigationCVDispatchProps;
// & InvestigationCVStateProps;

const InvestigationCardView = (
  props: InvestigationCVCombinedProps
): React.ReactElement => {
  const { fetchData, fetchCount } = props; // totalDataCount
  const [fetchedCount, setFetchedCount] = React.useState(false);

  React.useEffect(() => {
    // Fetch count.
    if (!fetchedCount) {
      fetchCount();
      setFetchedCount(true);
    }
  }, [fetchedCount, fetchCount, setFetchedCount]); // fetchedData, fetchData,

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
        // totalDataCount={totalDataCount}
        loadData={fetchData}
        // TODO: Simplify title usage; look at the need for dataKey, label and link.
        title={{
          // Provide both the dataKey (for tooltip) and link to render.
          dataKey: 'TITLE',
          link: (investigation: Investigation) => {
            return investigationLink(investigation.ID, investigation.TITLE);
          },
        }}
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
        // TODO: Test image.
        // image={{
        //   url:
        //     'https://www.iconbolt.com/iconsets/streamline-regular/lab-flask-experiment.svg',
        //   title: 'Investigation Image',
        // }}
      />
    </Paper>
  );
};

// const mapStateToProps = (state: StateType): InvestigationCVStateProps => {
//   return {
//     data: state.dgcommon.data,
//     totalDataCount: state.dgcommon.totalDataCount,
//   };
// };

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): InvestigationCVDispatchProps => ({
  fetchData: (offsetParams?: IndexRange) =>
    dispatch(fetchInvestigations({ offsetParams })),
  fetchCount: () => dispatch(fetchInvestigationCount()),
});

export default connect(null, mapDispatchToProps)(InvestigationCardView);
