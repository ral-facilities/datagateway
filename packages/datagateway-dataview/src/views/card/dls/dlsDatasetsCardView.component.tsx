// import React from 'react';

// import CardView from '../cardView.component';
// import {
//   Entity,
//   DownloadCartItem,
//   fetchDatasets,
//   fetchDatasetCount,
//   fetchDatasetDetails,
//   addToCart,
//   removeFromCart,
//   Dataset,
//   tableLink,
//   fetchFilter,
//   fetchDatasetSize,
//   FiltersType,
//   pushPageFilter,
//   Filter,
//   TextColumnFilter,
//   DateColumnFilter,
//   DateFilter,
// } from 'datagateway-common';
// import { IndexRange } from 'react-virtualized';
// import {
//   StateType,
//   FilterDataType,
// } from 'datagateway-common/lib/state/app.types';
// import { ThunkDispatch } from 'redux-thunk';
// import { AnyAction } from 'redux';
// import { connect } from 'react-redux';
// import {
//   AddCircleOutlineOutlined,
//   RemoveCircleOutlineOutlined,
//   ConfirmationNumber,
//   CalendarToday,
// } from '@material-ui/icons';
// import { Button } from '@material-ui/core';
// import DatasetDetailsPanel from '../../detailsPanels/dls/datasetDetailsPanel.component';

// interface DLSDatasetsCVProps {
//   proposalName: string;
//   investigationId: string;
// }

// interface DLSDatasetsCVStateProps {
//   data: Entity[];
//   totalDataCount: number;
//   cartItems: DownloadCartItem[];
//   filterData: FilterDataType;
//   filters: FiltersType;
// }

// interface DLSDatasetsCVDispatchProps {
//   fetchData: (
//     investigationId: number,
//     offsetParams: IndexRange
//   ) => Promise<void>;
//   fetchCount: (datasetId: number) => Promise<void>;
//   fetchDetails: (datasetId: number) => Promise<void>;
//   fetchSize: (investigationId: number) => Promise<void>;
//   addToCart: (entityIds: number[]) => Promise<void>;
//   removeFromCart: (entityIds: number[]) => Promise<void>;
//   fetchTypeFilter: (datasetId: number) => Promise<void>;
//   pushFilters: (filter: string, data: Filter | null) => Promise<void>;
// }

// type DLSDatasetsCVCombinedProps = DLSDatasetsCVProps &
//   DLSDatasetsCVStateProps &
//   DLSDatasetsCVDispatchProps;

// const DLSDatasetsCardView = (
//   props: DLSDatasetsCVCombinedProps
// ): React.ReactElement => {
//   const {
//     proposalName,
//     investigationId,
//     data,
//     totalDataCount,
//     fetchData,
//     fetchCount,
//     fetchTypeFilter,
//     fetchDetails,
//     fetchSize,
//     cartItems,
//     filterData,
//     addToCart,
//     removeFromCart,
//     filters,
//     pushFilters,
//   } = props;

//   const [fetchedCount, setFetchedCount] = React.useState(false);
//   const [fetchedFilters, setFetchedFilters] = React.useState(false);
//   const [datasetIds, setDatasetIds] = React.useState<number[]>([]);

//   const selectedCards = React.useMemo(
//     () =>
//       cartItems
//         .filter(
//           (cartItem) =>
//             cartItem.entityType === 'dataset' &&
//             datasetIds.includes(cartItem.entityId)
//         )
//         .map((cartItem) => cartItem.entityId),
//     [cartItems, datasetIds]
//   );

//   const typeFilteredItems = React.useMemo(
//     () => ('TYPE_ID' in filterData ? filterData['TYPE_ID'] : []),
//     [filterData]
//   );

//   const textFilter = (label: string, dataKey: string): React.ReactElement => (
//     <TextColumnFilter
//       label={label}
//       value={filters[dataKey] as string}
//       onChange={(value: string) => pushFilters(dataKey, value ? value : null)}
//     />
//   );

//   const dateFilter = (label: string, dataKey: string): React.ReactElement => (
//     <DateColumnFilter
//       label={label}
//       value={filters[dataKey] as DateFilter}
//       onChange={(value: { startDate?: string; endDate?: string } | null) =>
//         pushFilters(dataKey, value ? value : null)
//       }
//     />
//   );

//   React.useEffect(() => {
//     setDatasetIds(data.map((dataset) => dataset.ID));

//     if (!fetchedCount) {
//       fetchCount(parseInt(investigationId));
//       setFetchedCount(true);
//     }

//     if (!fetchedFilters) {
//       fetchTypeFilter(parseInt(investigationId));
//       setFetchedFilters(true);
//     }
//   }, [
//     investigationId,
//     data,
//     fetchedCount,
//     fetchCount,
//     fetchedFilters,
//     fetchTypeFilter,
//   ]);

//   return (
//     <CardView
//       data={data}
//       loadData={(params) => fetchData(parseInt(investigationId), params)}
//       loadCount={() => fetchCount(parseInt(investigationId))}
//       totalDataCount={totalDataCount}
//       title={{
//         label: 'Name',
//         dataKey: 'NAME',
//         content: (dataset: Dataset) =>
//           tableLink(
//             `/browse/proposal/${proposalName}/investigation/${investigationId}/dataset/${dataset.ID}/datafile`,
//             dataset.NAME
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
//           icon: <ConfirmationNumber />,
//           label: 'Datafile Count',
//           dataKey: 'DATAFILE_COUNT',
//           disableSort: true,
//         },
//         {
//           icon: <CalendarToday />,
//           label: 'Create Time',
//           dataKey: 'CREATE_TIME',
//           filterComponent: dateFilter,
//         },
//         {
//           icon: <CalendarToday />,
//           label: 'Modified Time',
//           dataKey: 'MOD_TIME',
//           filterComponent: dateFilter,
//         },
//         {
//           icon: <CalendarToday />,
//           label: 'Start Date',
//           dataKey: 'STARTDATE',
//           filterComponent: dateFilter,
//         },
//         {
//           icon: <CalendarToday />,
//           label: 'End Date',
//           dataKey: 'END_DATE',
//           filterComponent: dateFilter,
//         },
//       ]}
//       moreInformation={(dataset: Dataset) => (
//         <DatasetDetailsPanel
//           rowData={dataset}
//           fetchDetails={fetchDetails}
//           fetchSize={fetchSize}
//         />
//       )}
//       buttons={[
//         function cartButton(dataset: Dataset) {
//           return !(selectedCards && selectedCards.includes(dataset.ID)) ? (
//             <Button
//               id="add-to-cart-btn"
//               variant="contained"
//               color="primary"
//               startIcon={<AddCircleOutlineOutlined />}
//               disableElevation
//               onClick={() => addToCart([dataset.ID])}
//             >
//               Add to cart
//             </Button>
//           ) : (
//             <Button
//               id="remove-from-cart-btn"
//               variant="contained"
//               color="secondary"
//               startIcon={<RemoveCircleOutlineOutlined />}
//               disableElevation
//               onClick={() => {
//                 if (selectedCards && selectedCards.includes(dataset.ID))
//                   removeFromCart([dataset.ID]);
//               }}
//             >
//               Remove from cart
//             </Button>
//           );
//         },
//       ]}
//       customFilters={[
//         {
//           label: 'Type ID',
//           dataKey: 'TYPE_ID',
//           filterItems: typeFilteredItems,
//         },
//       ]}
//     />
//   );
// };

// const mapDispatchToProps = (
//   dispatch: ThunkDispatch<StateType, null, AnyAction>
// ): DLSDatasetsCVDispatchProps => ({
//   fetchData: (investigationId: number, offsetParams: IndexRange) =>
//     dispatch(
//       fetchDatasets({
//         offsetParams,
//         getDatafileCount: true,
//         additionalFilters: [
//           {
//             filterType: 'where',
//             filterValue: JSON.stringify({
//               INVESTIGATION_ID: { eq: investigationId },
//             }),
//           },
//         ],
//       })
//     ),
//   fetchCount: (investigationId: number) =>
//     dispatch(
//       fetchDatasetCount([
//         {
//           filterType: 'where',
//           filterValue: JSON.stringify({
//             INVESTIGATION_ID: { eq: investigationId },
//           }),
//         },
//       ])
//     ),
//   fetchDetails: (datasetId: number) => dispatch(fetchDatasetDetails(datasetId)),
//   fetchSize: (datasetId: number) => dispatch(fetchDatasetSize(datasetId)),
//   addToCart: (entityIds: number[]) => dispatch(addToCart('dataset', entityIds)),
//   removeFromCart: (entityIds: number[]) =>
//     dispatch(removeFromCart('dataset', entityIds)),
//   fetchTypeFilter: (investigationId: number) =>
//     dispatch(
//       fetchFilter('dataset', 'TYPE_ID', [
//         {
//           filterType: 'where',
//           filterValue: JSON.stringify({
//             INVESTIGATION_ID: { eq: investigationId },
//           }),
//         },
//       ])
//     ),
//   pushFilters: (filter: string, data: Filter | null) =>
//     dispatch(pushPageFilter(filter, data)),
// });

// const mapStateToProps = (state: StateType): DLSDatasetsCVStateProps => {
//   return {
//     data: state.dgcommon.data,
//     totalDataCount: state.dgcommon.totalDataCount,
//     cartItems: state.dgcommon.cartItems,
//     filterData: state.dgcommon.filterData,
//     filters: state.dgcommon.filters,
//   };
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(DLSDatasetsCardView);

export {};
