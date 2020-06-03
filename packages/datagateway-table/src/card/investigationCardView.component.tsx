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

import CardView from './cardView.component';
import { Button } from '@material-ui/core';
import {
  AddCircleOutlineOutlined,
  RemoveCircleOutlineOutlined,
} from '@material-ui/icons';

interface InvestigationCVDispatchProps {
  fetchData: (offsetParams: IndexRange) => Promise<void>;
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
    // TODO: Since CardView is a separate component, we should not couple the data from redux to it,
    //       and pass it through here.
    // TODO: Support for more simpler data types i.e. strings to directly passed or different ways
    //       of passing data to the card view (how can we achieve this if the data is not Entity[]).
    // TODO: Add support for pagination here (?), card layout type (buttons), card widths, sort, filtering.
    <CardView
      data={data}
      totalDataCount={totalDataCount}
      loadData={fetchData}
      filters={[{ label: 'Type', dataKey: 'TYPE_ID' }]}
      // TODO: Simplify title usage; look at the need for dataKey, label and link.
      title={{
        // Provide both the dataKey (for tooltip) and link to render.
        dataKey: 'TITLE',
        content: (investigation: Investigation) => {
          return investigationLink(investigation.ID, investigation.TITLE, view);
        },
      }}
      description={{ dataKey: 'SUMMARY' }}
      furtherInformation={[
        {
          label: 'DOI',
          dataKey: 'DOI',
        },
        {
          label: 'Visit ID',
          dataKey: 'VISIT_ID',
        },
        {
          label: 'RB Number',
          dataKey: 'RB_NUMBER',
        },
        {
          label: 'Dataset Count',
          dataKey: 'DATASET_COUNT',
        },
        {
          label: 'Start Date',
          dataKey: 'STARTDATE',
        },
        {
          label: 'End Date',
          dataKey: 'ENDDATE',
        },
      ]}
      buttons={[
        function cartButton(investigation: Investigation) {
          return !(
            selectedCards && selectedCards.includes(investigation.ID)
          ) ? (
            <Button
              id="add-to-cart-btn"
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineOutlined />}
              disableElevation
              onClick={() => addToCart([investigation.ID])}
            >
              Add to cart
            </Button>
          ) : (
            <Button
              id="remove-from-cart-btn"
              variant="contained"
              color="secondary"
              startIcon={<RemoveCircleOutlineOutlined />}
              disableElevation
              onClick={() => {
                if (selectedCards && selectedCards.includes(investigation.ID))
                  removeFromCart([investigation.ID]);
              }}
            >
              Remove from cart
            </Button>
          );
        },
      ]}
      // TODO: Test image.
      // image={{
      //   url:
      //     'https://www.iconbolt.com/iconsets/streamline-regular/lab-flask-experiment.svg',
      //   title: 'Investigation Image',
      // }}
    />
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
  fetchData: (offsetParams: IndexRange) =>
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
