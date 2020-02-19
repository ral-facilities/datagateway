import React from 'react';
import { Typography, IconButton } from '@material-ui/core';
import {
  Table,
  TableActionProps,
  formatBytes,
  TextColumnFilter,
  DateColumnFilter,
  Order,
  Filter,
  Datafile,
  Entity,
  DownloadCartItem,
  fetchDatafiles,
  downloadDatafile,
  fetchDatafileCount,
  addToCart,
  removeFromCart,
  fetchAllIds,
  sortTable,
  filterTable,
  clearTable,
} from 'datagateway-common';
import { IndexRange } from 'react-virtualized';
import { connect } from 'react-redux';
import { StateType } from '../state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { Action, AnyAction } from 'redux';
// import useAfterMountEffect from '../utils';

interface DatafileSearchTableProps {
  // datasetId: string;
}

interface DatafileSearchTableStoreProps {
  sort: {
    [column: string]: Order;
  };
  // filters: {
  //   [column: string]: Filter;
  // };
  data: Entity[];
  // totalDataCount: number;
  loading: boolean;
  // error: string | null;
  // cartItems: DownloadCartItem[];
  // allIds: number[];
}

// interface DatafileSearchTableDispatchProps {
//   sortTable: (column: string, order: Order | null) => Action;
//   filterTable: (column: string, filter: Filter | null) => Action;
//   fetchData: (datasetId: number, offsetParams: IndexRange) => Promise<void>;
//   fetchCount: (datasetId: number) => Promise<void>;
//   downloadData: (datafileId: number, filename: string) => Promise<void>;
//   addToCart: (entityIds: number[]) => Promise<void>;
//   removeFromCart: (entityIds: number[]) => Promise<void>;
//   fetchAllIds: () => Promise<void>;
//   clearTable: () => Action;
// }

type DatafileSearchTableCombinedProps = DatafileSearchTableProps &
  DatafileSearchTableStoreProps;
// DatafileSearchTableDispatchProps;

const DatafileSearchTable = (
  props: DatafileSearchTableCombinedProps
): React.ReactElement => {
  const {
    data,
    // totalDataCount,
    // fetchData,
    // fetchCount,
    sort,
    // sortTable,
    // filters,
    // filterTable,
    // datasetId,
    // downloadData,
    // cartItems,
    // addToCart,
    // removeFromCart,
    // clearTable,
    // allIds,
    // fetchAllIds,
    loading,
  } = props;

  // const selectedRows = React.useMemo(
  //   () =>
  //     cartItems
  //       .filter(
  //         cartItem =>
  //           cartItem.entityType === 'datafile' &&
  //           allIds.includes(cartItem.entityId)
  //       )
  //       .map(cartItem => cartItem.entityId),
  //   [cartItems, allIds]
  // );

  // React.useEffect(() => {
  //   clearTable();
  // }, [clearTable]);

  // useAfterMountEffect(() => {
  //   fetchCount(parseInt(datasetId));
  //   fetchData(parseInt(datasetId), { startIndex: 0, stopIndex: 49 });
  //   fetchAllIds();
  // }, [fetchCount, fetchData, fetchAllIds, sort, filters, datasetId]);

  // const textFilter = (label: string, dataKey: string): React.ReactElement => (
  //   <TextColumnFilter
  //     label={label}
  //     onChange={(value: string) => filterTable(dataKey, value ? value : null)}
  //   />
  // );

  // const dateFilter = (label: string, dataKey: string): React.ReactElement => (
  //   <DateColumnFilter
  //     label={label}
  //     onChange={(value: { startDate?: string; endDate?: string } | null) =>
  //       filterTable(dataKey, value)
  //     }
  //   />
  // );

  return (
    <Table
      loading={false}
      data={[
        {
          ID: 4,
          NAME: 'bongo',
          MOD_TIME: '9:00 1.1.20',
          CREATE_TIME: '8:00 1.1.20',
          INVESTIGATION_ID: 24,
        },
      ]}
      // ^^ test data
      // data={data}
      // loadMoreRows={params => fetchData(parseInt(datasetId), params)}
      // totalRowCount={totalDataCount}
      sort={sort}
      onSort={sortTable}
      // selectedRows={selectedRows}
      // allIds={allIds}
      // onCheck={addToCart}
      // onUncheck={removeFromCart}
      // detailsPanel={({ rowData }) => {
      //   const datafileData = rowData as Datafile;
      //   return (
      //     <div>
      //       <Typography>
      //         <b>Name:</b> {datafileData.NAME}
      //       </Typography>
      //       <Typography>
      //         <b>File Size:</b> {formatBytes(datafileData.FILESIZE)}
      //       </Typography>
      //       <Typography>
      //         <b>Location:</b> {datafileData.LOCATION}
      //       </Typography>
      //     </div>
      //   );
      // }}
      columns={[
        {
          label: 'Name',
          dataKey: 'NAME',
          // filterComponent: textFilter,
        },
        {
          label: 'Location',
          dataKey: 'LOCATION',
          // filterComponent: textFilter,
        },
        {
          label: 'Size',
          dataKey: 'FILESIZE',
          // cellContentRenderer: props => {
          //   return formatBytes(props.cellData);
          // },
        },
        {
          label: 'Modified Time',
          dataKey: 'MOD_TIME',
          // filterComponent: dateFilter,
        },
      ]}
    />
  );
};

// const mapDispatchToProps = (
//   dispatch: ThunkDispatch<StateType, null, AnyAction>,
//   ownProps: DatafileSearchTableProps
// ): DatafileSearchTableDispatchProps => ({
//   sortTable: (column: string, order: Order | null) =>
//     dispatch(sortTable(column, order)),
//   filterTable: (column: string, filter: Filter | null) =>
//     dispatch(filterTable(column, filter)),
//   fetchData: (datasetId: number, offsetParams: IndexRange) =>
//     dispatch(fetchDatafiles(datasetId, offsetParams)),
//   fetchCount: (datasetId: number) => dispatch(fetchDatafileCount(datasetId)),
//   downloadData: (datafileId: number, filename: string) =>
//     dispatch(downloadDatafile(datafileId, filename)),
//   addToCart: (entityIds: number[]) =>
//     dispatch(addToCart('datafile', entityIds)),
//   removeFromCart: (entityIds: number[]) =>
//     dispatch(removeFromCart('datafile', entityIds)),
//   fetchAllIds: () =>
//     dispatch(
//       fetchAllIds('datafile', [
//         {
//           filterType: 'where',
//           filterValue: JSON.stringify({
//             DATASET_ID: { eq: parseInt(ownProps.datasetId) },
//           }),
//         },
//       ])
//     ),
//   clearTable: () => dispatch(clearTable()),
// });

const mapStateToProps = (
  state: StateType,
  ownProps: DatafileSearchTableProps
): DatafileSearchTableStoreProps => {
  return {
    sort: state.dgcommon.sort,
    // filters: state.dgcommon.filters,
    data: state.dgcommon.data,
    // totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    // error: state.dgcommon.error,
    // cartItems: state.dgcommon.cartItems,
    // allIds: state.dgcommon.allIds,
  };
};

export default connect(mapStateToProps)(DatafileSearchTable);
