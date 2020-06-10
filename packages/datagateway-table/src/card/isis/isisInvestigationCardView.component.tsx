import React from 'react';
import CardView from '../cardView.component';
import {
  DownloadCartItem,
  Entity,
  fetchISISInvestigations,
  fetchISISInvestigationCount,
  fetchInvestigationDetails,
  addToCart,
  removeFromCart,
  Investigation,
  tableLink,
  formatBytes,
  clearData,
} from 'datagateway-common';
import { ThunkDispatch } from 'redux-thunk';
import { StateType, ViewsType } from 'datagateway-common/lib/state/app.types';
import { AnyAction, Action } from 'redux';
import { connect } from 'react-redux';
import { Button } from '@material-ui/core';
import {
  AddCircleOutlineOutlined,
  RemoveCircleOutlineOutlined,
} from '@material-ui/icons';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISInvestigationsCardViewProps {
  instrumentId: string;
  facilityCycleId: string;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISInvestigationsCVStateProps {
  data: Entity[];
  totalDataCount: number;
  cartItems: DownloadCartItem[];
  view: ViewsType;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISInvestigationsCVDispatchProps {
  fetchData: (instrumentId: number, facilityCycleId: number) => Promise<void>;
  fetchCount: (instrumentId: number, facilityCycleId: number) => Promise<void>;
  fetchDetails: (investigationId: number) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  clearData: () => Action;
}

type ISISInvestigationsCVCombinedProps = ISISInvestigationsCVDispatchProps &
  ISISInvestigationsCVStateProps &
  ISISInvestigationsCardViewProps;

const ISISInvestigationsCardView = (
  props: ISISInvestigationsCVCombinedProps
): React.ReactElement => {
  const {
    instrumentId,
    facilityCycleId,
    data,
    totalDataCount,
    cartItems,
    fetchData,
    fetchCount,
    addToCart,
    removeFromCart,
    view,
    clearData,
  } = props;

  const [fetchedData, setFetchedData] = React.useState(false);
  const [fetchedCount, setFetchedCount] = React.useState(false);
  const [investigationIds, setInvestigationIds] = React.useState<number[]>([]);

  const urlPrefix = `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation`;

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

  // Provide the filtered items to use to tag.
  const filteredItems = React.useMemo(
    () =>
      data.map(
        d =>
          d.INVESTIGATIONINSTRUMENT &&
          d.INVESTIGATIONINSTRUMENT[0].INSTRUMENT &&
          d.INVESTIGATIONINSTRUMENT[0].INSTRUMENT.NAME
      ),
    [data]
  );

  React.useEffect(() => {
    // TODO: React.useMemo?
    // Set the IDs of the investigation data.
    setInvestigationIds(data.map(investigation => investigation.ID));

    // TODO: Since for filtering we will fetch all data,
    //       we will fetch it here and not use pagination on fetch
    //       (this is only a temporary fix for filtering to work without having to fetch the whole data
    //        again for each filter for ISIS).
    console.log('data update: ', data);
    if (!fetchedData) {
      // Manually clear data in the state before fetch to prevent duplicate,
      // we do not clear in CardView and if we did it may cause in the data not showing up.
      clearData();
      fetchData(parseInt(instrumentId), parseInt(facilityCycleId));
      setFetchedData(true);
    }

    if (!fetchedCount) {
      fetchCount(parseInt(instrumentId), parseInt(facilityCycleId));
      setFetchedCount(true);
    }
  }, [
    instrumentId,
    facilityCycleId,
    data,
    fetchedData,
    fetchData,
    clearData,
    fetchedCount,
    fetchCount,
    setFetchedCount,
  ]);

  return (
    <CardView
      paginatedFetch={false}
      data={data}
      totalDataCount={totalDataCount}
      // TODO: Remove dataKey from filters.
      filters={[
        { label: 'Instrument', dataKey: 'TYPE_ID', filterItems: filteredItems },
      ]}
      title={{
        dataKey: 'TITLE',
        content: (investigation: Investigation) =>
          tableLink(
            `${urlPrefix}/${investigation.ID}/dataset`,
            investigation.TITLE,
            view
          ),
      }}
      description={{ dataKey: 'SUMMARY' }}
      furtherInformation={[
        // TODO: Do Visit Id and RB Number need links
        //       to the same dataset as the title?
        {
          label: 'Visit Id',
          dataKey: 'VISIT_ID',
        },
        {
          label: 'RB Number',
          dataKey: 'NAME',
        },
        // TODO: Change behaviour to not show label cases where content returns nothing?
        {
          label: 'DOI',
          dataKey: 'STUDYINVESTIGATION[0].STUDY.PID',
        },
        // TODO: Size showing as unknown (due to paginatedFetch=false in CardView not showing updated data).
        {
          label: 'Size',
          dataKey: 'SIZE',
          content: (investigation: Investigation) => {
            console.log('current SIZE: ', investigation.SIZE);
            return formatBytes(investigation.SIZE);
          },
        },
        // {
        //   label: 'Instrument',
        //   dataKey: 'INVESTIGATIONINSTRUMENT[0].INSTRUMENT.FULLNAME',
        // },
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
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): ISISInvestigationsCVDispatchProps => ({
  fetchData: (instrumentId: number, facilityCycleId: number) =>
    dispatch(
      fetchISISInvestigations({
        instrumentId,
        facilityCycleId,
        optionalParams: { getSize: true },
      })
    ),
  fetchCount: (instrumentId: number, facilityCycleId: number) =>
    dispatch(fetchISISInvestigationCount(instrumentId, facilityCycleId)),
  fetchDetails: (investigationId: number) =>
    dispatch(fetchInvestigationDetails(investigationId)),
  addToCart: (entityIds: number[]) =>
    dispatch(addToCart('investigation', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('investigation', entityIds)),
  clearData: () => dispatch(clearData()),
});

const mapStateToProps = (state: StateType): ISISInvestigationsCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    cartItems: state.dgcommon.cartItems,
    view: state.dgcommon.query.view,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISInvestigationsCardView);
