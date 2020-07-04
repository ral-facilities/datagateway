import { IconButton } from '@material-ui/core';
import { GetApp } from '@material-ui/icons';
import {
  addToCart,
  clearTable,
  Datafile,
  DateColumnFilter,
  DateFilter,
  DownloadCartItem,
  downloadDatafile,
  Entity,
  fetchAllIds,
  fetchDatafileCount,
  fetchDatafileDetails,
  fetchDatafiles,
  Filter,
  formatBytes,
  Order,
  pushPageFilter,
  removeFromCart,
  sortTable,
  Table,
  TableActionProps,
  TextColumnFilter,
} from 'datagateway-common';
import React from 'react';
import { connect } from 'react-redux';
import { IndexRange } from 'react-virtualized';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import useAfterMountEffect from '../../../utils';
import DatafileDetailsPanel from '../../detailsPanels/isis/datafileDetailsPanel.component';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISDatafilesTableProps {
  datasetId: string;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISDatafilesTableStoreProps {
  sort: {
    [column: string]: Order;
  };
  filters: {
    [column: string]: Filter;
  };
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  error: string | null;
  cartItems: DownloadCartItem[];
  allIds: number[];
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISDatafilesTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  // filterTable: (column: string, filter: Filter | null) => Action;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  fetchData: (datasetId: number, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (datasetId: number) => Promise<void>;
  clearTable: () => Action;
  downloadData: (datafileId: number, filename: string) => Promise<void>;
  fetchDetails: (datasetId: number) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchAllIds: () => Promise<void>;
}

type ISISDatafilesTableCombinedProps = ISISDatafilesTableProps &
  ISISDatafilesTableStoreProps &
  ISISDatafilesTableDispatchProps;

const ISISDatafilesTable = (
  props: ISISDatafilesTableCombinedProps
): React.ReactElement => {
  const {
    data,
    totalDataCount,
    fetchData,
    fetchCount,
    clearTable,
    sort,
    sortTable,
    filters,
    // filterTable,
    pushFilters,
    datasetId,
    downloadData,
    fetchDetails,
    loading,
    cartItems,
    addToCart,
    removeFromCart,
    allIds,
    fetchAllIds,
  } = props;

  const selectedRows = React.useMemo(
    () =>
      cartItems
        .filter(
          cartItem =>
            cartItem.entityType === 'datafile' &&
            allIds.includes(cartItem.entityId)
        )
        .map(cartItem => cartItem.entityId),
    [cartItems, allIds]
  );

  React.useEffect(() => {
    clearTable();
  }, [clearTable]);

  useAfterMountEffect(() => {
    fetchCount(parseInt(datasetId));
    fetchData(parseInt(datasetId), { startIndex: 0, stopIndex: 49 });
    fetchAllIds();
  }, [fetchCount, fetchData, sort, filters, datasetId, fetchAllIds]);

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      value={filters[dataKey] as string}
      // onChange={(value: string) => filterTable(dataKey, value ? value : null)}
      onChange={(value: string) => pushFilters(dataKey, value ? value : null)}
    />
  );

  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <DateColumnFilter
      label={label}
      value={filters[dataKey] as DateFilter}
      onChange={(value: { startDate?: string; endDate?: string } | null) =>
        // filterTable(dataKey, value)
        pushFilters(dataKey, value ? value : null)
      }
    />
  );

  return (
    <Table
      loading={loading}
      data={data}
      loadMoreRows={params => fetchData(parseInt(datasetId), params)}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={sortTable}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      detailsPanel={({ rowData, detailsPanelResize }) => {
        return (
          <DatafileDetailsPanel
            rowData={rowData}
            detailsPanelResize={detailsPanelResize}
            fetchDetails={fetchDetails}
          />
        );
      }}
      actions={[
        function downloadButton({ rowData }: TableActionProps) {
          const datafileData = rowData as Datafile;
          if (datafileData.LOCATION) {
            return (
              <IconButton
                aria-label="Download"
                key="download"
                size="small"
                onClick={() => {
                  // @ts-ignore - otherwise we need to check LOCATION isn't undefined again
                  downloadData(datafileData.ID, datafileData.LOCATION);
                }}
              >
                <GetApp />
              </IconButton>
            );
          } else {
            return null;
          }
        },
      ]}
      columns={[
        {
          label: 'Name',
          dataKey: 'NAME',
          filterComponent: textFilter,
        },
        {
          label: 'Location',
          dataKey: 'LOCATION',
          filterComponent: textFilter,
        },
        {
          label: 'Size',
          dataKey: 'FILESIZE',
          cellContentRenderer: props => {
            return formatBytes(props.cellData);
          },
          filterComponent: textFilter,
        },
        {
          label: 'Modified Time',
          dataKey: 'MOD_TIME',
          filterComponent: dateFilter,
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>,
  ownProps: ISISDatafilesTableProps
): ISISDatafilesTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  // filterTable: (column: string, filter: Filter | null) =>
  //   dispatch(filterTable(column, filter)),
  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  fetchData: (datasetId: number, offsetParams: IndexRange) =>
    dispatch(fetchDatafiles(datasetId, offsetParams)),
  fetchCount: (datasetId: number) => dispatch(fetchDatafileCount(datasetId)),
  clearTable: () => dispatch(clearTable()),
  fetchDetails: (datafileId: number) =>
    dispatch(fetchDatafileDetails(datafileId)),
  downloadData: (datafileId: number, filename: string) =>
    dispatch(downloadDatafile(datafileId, filename)),
  addToCart: (entityIds: number[]) =>
    dispatch(addToCart('datafile', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('datafile', entityIds)),
  fetchAllIds: () =>
    dispatch(
      fetchAllIds('datafile', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            DATASET_ID: { eq: parseInt(ownProps.datasetId) },
          }),
        },
      ])
    ),
});

const mapStateToProps = (state: StateType): ISISDatafilesTableStoreProps => {
  return {
    sort: state.dgcommon.sort,
    filters: state.dgcommon.filters,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    error: state.dgcommon.error,
    cartItems: state.dgcommon.cartItems,
    allIds: state.dgcommon.allIds,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ISISDatafilesTable);
