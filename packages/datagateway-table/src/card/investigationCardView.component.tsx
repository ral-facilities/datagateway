import React from 'react';
import { IndexRange } from 'react-virtualized';
import {
  fetchInvestigationCount,
  fetchInvestigations,
  Investigation,
  investigationLink,
  addToCart,
  removeFromCart,
  DownloadCartItem,
  Entity,
} from 'datagateway-common';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { StateType, ViewsType } from 'datagateway-common/lib/state/app.types';
import { connect } from 'react-redux';
import { Paper } from '@material-ui/core';

import CardView from './cardView.component';

interface InvestigationCVDispatchProps {
  fetchData: (offsetParams?: IndexRange) => Promise<void>;
  fetchCount: () => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
}

interface InvestigationCVStateProps {
  data: Entity[];
  totalDataCount: number;
  cartItems: DownloadCartItem[];
  view: ViewsType;
}

type InvestigationCVCombinedProps = InvestigationCVDispatchProps &
  InvestigationCVStateProps;

const InvestigationCardView = (
  props: InvestigationCVCombinedProps
): React.ReactElement => {
  const {
    data,
    totalDataCount,
    cartItems,
    fetchData,
    fetchCount,
    addToCart,
    removeFromCart,
    view,
  } = props;
  const [fetchedCount, setFetchedCount] = React.useState(false);
  const [investigationIds, setInvestigationIds] = React.useState<number[]>([]);

  const selectedCards = React.useMemo(
    () =>
      cartItems
        .filter(
          cartItem =>
            cartItem.entityType === 'investigation' &&
            investigationIds.includes(cartItem.entityId)
        )
        .map(cartItem => cartItem.entityId),
    [cartItems, investigationIds]
  );

  React.useEffect(() => {
    // TODO: React.useMemo?
    // Set the IDs of the data.
    setInvestigationIds(data.map(investigation => investigation.ID));

    // Fetch count.
    if (!fetchedCount) {
      fetchCount();
      setFetchedCount(true);
    }
  }, [data, fetchedCount, fetchCount, setFetchedCount]);

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
        data={data}
        totalDataCount={totalDataCount}
        loadData={fetchData}
        selectedCards={selectedCards}
        onSelect={addToCart}
        onDeselect={removeFromCart}
        // TODO: Simplify title usage; look at the need for dataKey, label and link.
        title={{
          // Provide both the dataKey (for tooltip) and link to render.
          dataKey: 'TITLE',
          link: (investigation: Investigation) => {
            return investigationLink(
              investigation.ID,
              investigation.TITLE,
              view
            );
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

const mapStateToProps = (state: StateType): InvestigationCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    cartItems: state.dgcommon.cartItems,
    view: state.dgcommon.query.view,
  };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): InvestigationCVDispatchProps => ({
  fetchData: (offsetParams?: IndexRange) =>
    dispatch(fetchInvestigations({ offsetParams })),
  fetchCount: () => dispatch(fetchInvestigationCount()),
  addToCart: (entityIds: number[]) =>
    dispatch(addToCart('investigation', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('investigation', entityIds)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InvestigationCardView);
