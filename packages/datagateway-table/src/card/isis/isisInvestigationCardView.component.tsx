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
} from 'datagateway-common';
import { IndexRange } from 'react-virtualized';
import { ThunkDispatch } from 'redux-thunk';
import { StateType, ViewsType } from 'datagateway-common/lib/state/app.types';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
// import ArrowTooltip from '../../page/arrowtooltip.component';

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
      selectedCards={selectedCards}
      onSelect={addToCart}
      onDeselect={removeFromCart}
      title={{
        dataKey: 'TITLE',
        content: (investigation: Investigation) =>
          tableLink(
            `${urlPrefix}/${investigation.ID}/dataset`,
            investigation.TITLE,
            view
          ),
      }}
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
        {
          // TODO: Change behaviour to not show label cases where content returns nothing?
          label: 'DOI',
          dataKey: 'STUDYINVESTIGATION',
          content: (investigation: Investigation) => {
            if (
              investigation.STUDYINVESTIGATION &&
              investigation.STUDYINVESTIGATION[0].STUDY
            ) {
              if (investigation.STUDYINVESTIGATION[0].STUDY.PID)
                return investigation.STUDYINVESTIGATION[0].STUDY.PID;
            }
            return 'N/A';
          },
        },
        {
          label: 'Size',
          dataKey: 'SIZE',
          content: (investigation: Investigation) =>
            formatBytes(investigation.SIZE),
        },
        // TODO: Support ArrowTooltip in this case to shorten large text.
        // {
        //   // TODO: Change behaviour to not show label cases where content returns nothing?
        //   // TODO: Use drilling down into nested data value.

        //   label: 'Instrument',
        //   dataKey: 'INVESTIGATIONINSTRUMENT',
        //   content: (investigation: Investigation) => {
        //     if (
        //       investigation.INVESTIGATIONINSTRUMENT &&
        //       investigation.INVESTIGATIONINSTRUMENT[0].INSTRUMENT
        //     ) {
        //       return (
        //         <ArrowTooltip
        //           title={
        //             investigation.INVESTIGATIONINSTRUMENT[0].INSTRUMENT.FULLNAME
        //           }
        //           percentageWidth={5}
        //         >
        //           <span>
        //             {
        //               investigation.INVESTIGATIONINSTRUMENT[0].INSTRUMENT
        //                 .FULLNAME
        //             }
        //           </span>
        //         </ArrowTooltip>
        //       );
        //     } else {
        //       return 'N/A';
        //     }
        //   },
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
