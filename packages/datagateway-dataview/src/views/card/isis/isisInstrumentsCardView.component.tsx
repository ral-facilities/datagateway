// import { Link } from '@material-ui/core';
// import {
//   Entity,
//   fetchInstrumentCount,
//   fetchInstrumentDetails,
//   fetchInstruments,
//   Filter,
//   FiltersType,
//   Instrument,
//   pushPageFilter,
//   tableLink,
//   TextColumnFilter,
// } from 'datagateway-common';
// import { ViewsType } from 'datagateway-common/lib/state/app.types';
// import React from 'react';
// import { connect } from 'react-redux';
// import { IndexRange } from 'react-virtualized';
// import { AnyAction } from 'redux';
// import { ThunkDispatch } from 'redux-thunk';
// import { StateType } from '../../../state/app.types';
// import InstrumentDetailsPanel from '../../detailsPanels/isis/instrumentDetailsPanel.component';
// import CardView from '../cardView.component';

// // eslint-disable-next-line @typescript-eslint/interface-name-prefix
// interface ISISInstrumentsCVDispatchProps {
//   fetchData: (offsetParams: IndexRange) => Promise<void>;
//   fetchCount: () => Promise<void>;
//   fetchDetails: (instrumentId: number) => Promise<void>;
//   pushFilters: (filter: string, data: Filter | null) => Promise<void>;
// }

// // eslint-disable-next-line @typescript-eslint/interface-name-prefix
// interface ISISInstrumentsCVStateProps {
//   data: Entity[];
//   totalDataCount: number;
//   view: ViewsType;
//   filters: FiltersType;
// }

// type ISISInstrumentsCVCombinedProps = ISISInstrumentsCVDispatchProps &
//   ISISInstrumentsCVStateProps;

// const ISISInstrumentsCardView = (
//   props: ISISInstrumentsCVCombinedProps
// ): React.ReactElement => {
//   const {
//     data,
//     totalDataCount,
//     fetchData,
//     fetchCount,
//     fetchDetails,
//     view,
//     filters,
//     pushFilters,
//   } = props;

//   const [fetchedCount, setFetchedCount] = React.useState(false);

//   const textFilter = (label: string, dataKey: string): React.ReactElement => (
//     <TextColumnFilter
//       label={label}
//       value={filters[dataKey] as string}
//       onChange={(value: string) => pushFilters(dataKey, value ? value : null)}
//     />
//   );

//   React.useEffect(() => {
//     // Load count to trigger data to be fetched.
//     if (!fetchedCount) {
//       fetchCount();
//       setFetchedCount(true);
//     }
//   }, [data, fetchedCount, fetchCount, setFetchedCount]);

//   return (
//     <CardView
//       data={data}
//       totalDataCount={totalDataCount}
//       loadData={fetchData}
//       loadCount={fetchCount}
//       title={{
//         label: 'Name',
//         dataKey: 'FULLNAME',
//         content: (instrument: Instrument) =>
//           tableLink(
//             `/browse/instrument/${instrument.ID}/facilityCycle`,
//             instrument.FULLNAME || instrument.NAME,
//             view
//           ),
//         filterComponent: textFilter,
//       }}
//       description={{
//         label: 'Description',
//         dataKey: 'DESCRIPTION',
//         filterComponent: textFilter,
//       }}
//       information={[
//         {
//           label: 'Type',
//           dataKey: 'TYPE',
//           filterComponent: textFilter,
//         },
//         {
//           label: 'URL',
//           dataKey: 'URL',
//           // eslint-disable-next-line react/display-name
//           content: (instrument: Instrument) => (
//             <Link href={instrument.URL}>{instrument.URL}</Link>
//           ),
//           filterComponent: textFilter,
//         },
//       ]}
//       moreInformation={(instrument: Instrument) => (
//         <InstrumentDetailsPanel
//           rowData={instrument}
//           fetchDetails={fetchDetails}
//         />
//       )}
//     />
//   );
// };

// const mapStateToProps = (state: StateType): ISISInstrumentsCVStateProps => {
//   return {
//     data: state.dgcommon.data,
//     totalDataCount: state.dgcommon.totalDataCount,
//     view: state.dgcommon.query.view,
//     filters: state.dgcommon.filters,
//   };
// };

// const mapDispatchToProps = (
//   dispatch: ThunkDispatch<StateType, null, AnyAction>
// ): ISISInstrumentsCVDispatchProps => ({
//   fetchData: (offsetParams: IndexRange) =>
//     dispatch(fetchInstruments(offsetParams)),
//   fetchCount: () => dispatch(fetchInstrumentCount()),
//   fetchDetails: (instrumentId: number) =>
//     dispatch(fetchInstrumentDetails(instrumentId)),
//   pushFilters: (filter: string, data: Filter | null) =>
//     dispatch(pushPageFilter(filter, data)),
// });

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(ISISInstrumentsCardView);

export {};
