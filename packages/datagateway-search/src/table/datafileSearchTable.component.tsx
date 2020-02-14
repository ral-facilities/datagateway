import React from 'react';
import { Typography, IconButton } from '@material-ui/core';
import {
  Table,
  TableActionProps,
  formatBytes,
  TextColumnFilter,
  DateColumnFilter,
  Order,
  // Filter,
  // Datafile,
  Entity,
  // DownloadCartItem,
  // fetchDatafiles,
  // downloadDatafile,
  // fetchDatafileCount,
  // addToCart,
  // removeFromCart,
  // fetchAllIds,
  sortTable,
  filterTable,
  clearTable,
} from 'datagateway-common';
import { Action } from 'redux';
import { IndexRange } from 'react-virtualized';
import { connect } from 'react-redux';
import { StateType } from '../state/app.types';

interface DatafileSearchTableProps {
  //   datasetId: string;
}

interface DatafileSearchTableStoreProps {
  sort: {
    [column: string]: Order;
  };
  //   filters: {
  //     [column: string]: Filter;
  //   };
  //   data: Entity[];
  data: Entity[];
  //   totalDataCount: number;
  loading: boolean;
  //   error: string | null;
  //   cartItems: DownloadCartItem[];
  //   allIds: number[];
}

// interface DatafileSearchTableDispatchProps {
//   //   sortTable: (column: string, order: Order | null) => Action;
//   //   filterTable: (column: string, filter: Filter | null) => Action;
//   fetchData: (datasetId: number, offsetParams: IndexRange) => Promise<void>;
//   //   fetchCount: (datasetId: number) => Promise<void>;
//   //   downloadData: (datafileId: number, filename: string) => Promise<void>;
//   //   addToCart: (entityIds: number[]) => Promise<void>;
//   //   removeFromCart: (entityIds: number[]) => Promise<void>;
//   //   fetchAllIds: () => Promise<void>;
//   //   clearTable: () => Action;
// }

type DatafileSearchTableCombinedProps = DatafileSearchTableProps &
  DatafileSearchTableStoreProps;
//   &
//   DatafileSearchTableDispatchProps;

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

  //   const selectedRows = React.useMemo(
  //     () =>
  //       cartItems
  //         .filter(
  //           cartItem =>
  //             cartItem.entityType === 'datafile' &&
  //             allIds.includes(cartItem.entityId)
  //         )
  //         .map(cartItem => cartItem.entityId),
  //     [cartItems, allIds]
  //   );

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
      //   loadMoreRows={params => fetchData(parseInt(datasetId), params)}
      //   totalRowCount={totalDataCount}
      sort={sort}
      onSort={sortTable}
      //   selectedRows={selectedRows}
      //   allIds={allIds}
      //   onCheck={addToCart}
      //   onUncheck={removeFromCart}
      //   detailsPanel={({ rowData }) => {
      //     const datafileData = rowData as Datafile;
      //     return (
      //       <div>
      //         <Typography>
      //           <b>Name:</b> {datafileData.NAME}
      //         </Typography>
      //         <Typography>
      //           <b>File Size:</b> {formatBytes(datafileData.FILESIZE)}
      //         </Typography>
      //         <Typography>
      //           <b>Location:</b> {datafileData.LOCATION}
      //         </Typography>
      //       </div>
      //     );
      //   }}
      columns={[
        {
          label: 'Name',
          dataKey: 'NAME',
          //   filterComponent: textFilter,
        },
        {
          label: 'Location',
          dataKey: 'LOCATION',
          //   filterComponent: textFilter,
        },
        {
          label: 'Size',
          dataKey: 'FILESIZE',
          cellContentRenderer: props => {
            return formatBytes(props.cellData);
          },
        },
        {
          label: 'Modified Time',
          dataKey: 'MOD_TIME',
          //   filterComponent: dateFilter,
        },
      ]}
    />
  );
};

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
