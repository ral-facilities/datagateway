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
import { IndexRange } from 'react-virtualized';
import InvestigationDetailsPanel from '../../table/isis/detailsPanels/investigationDetailsPanel.component';

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
  fetchData: (
    instrumentId: number,
    facilityCycleId: number,
    offsetParams: IndexRange
  ) => Promise<void>;
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
    fetchDetails,
    addToCart,
    removeFromCart,
    view,
    clearData,
  } = props;

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

  React.useEffect(() => {
    // TODO: React.useMemo?
    // Set the IDs of the investigation data.
    setInvestigationIds(data.map(investigation => investigation.ID));

    if (!fetchedCount) {
      fetchCount(parseInt(instrumentId), parseInt(facilityCycleId));
      setFetchedCount(true);
    }
  }, [
    instrumentId,
    facilityCycleId,
    data,
    clearData,
    fetchedCount,
    fetchCount,
    setFetchedCount,
  ]);

  return (
    <CardView
      data={data}
      totalDataCount={totalDataCount}
      loadData={params =>
        fetchData(parseInt(instrumentId), parseInt(facilityCycleId), params)
      }
      loadCount={() =>
        fetchCount(parseInt(instrumentId), parseInt(facilityCycleId))
      }
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
      information={[
        {
          label: 'Visit Id',
          dataKey: 'VISIT_ID',
        },
        {
          label: 'RB Number',
          dataKey: 'NAME',
        },
        {
          label: 'DOI',
          dataKey: 'STUDYINVESTIGATION[0].STUDY.PID',
        },
        {
          label: 'Size',
          dataKey: 'SIZE',
          content: (investigation: Investigation) =>
            formatBytes(investigation.SIZE),
        },
        // TODO: Needs tooltip to handle overflowing text.
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
      moreInformation={(investigation: Investigation) => (
        <InvestigationDetailsPanel
          rowData={investigation}
          fetchDetails={fetchDetails}
        />
      )}
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
  fetchData: (
    instrumentId: number,
    facilityCycleId: number,
    offsetParams: IndexRange
  ) =>
    dispatch(
      fetchISISInvestigations({
        instrumentId,
        facilityCycleId,
        offsetParams,
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
