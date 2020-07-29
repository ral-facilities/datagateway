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
import { GetApp } from '@material-ui/icons';
import { ThunkDispatch } from 'redux-thunk';
import { connect } from 'react-redux';
import { StateType } from '../state/app.types';
import { Action, AnyAction } from 'redux';
import { IndexRange } from 'react-virtualized';
import useAfterMountEffect from '../utils';
import { useTranslation } from 'react-i18next';

import DescriptionIcon from '@material-ui/icons/Description';
import ExploreIcon from '@material-ui/icons/Explore';
import SaveIcon from '@material-ui/icons/Save';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';

interface DatafileTableProps {
  datasetId: string;
}

interface DatafileTableStoreProps {
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

interface DatafileTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (datasetId: number, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (datasetId: number) => Promise<void>;
  downloadData: (datafileId: number, filename: string) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchAllIds: () => Promise<void>;
  clearTable: () => Action;
}

type DatafileTableCombinedProps = DatafileTableProps &
  DatafileTableStoreProps &
  DatafileTableDispatchProps;

const DatafileTable = (
  props: DatafileTableCombinedProps
): React.ReactElement => {
  const {
    data,
    totalDataCount,
    fetchData,
    fetchCount,
    sort,
    sortTable,
    filters,
    filterTable,
    datasetId,
    downloadData,
    cartItems,
    addToCart,
    removeFromCart,
    clearTable,
    allIds,
    fetchAllIds,
    loading,
  } = props;

  const [t] = useTranslation();

  const selectedRows = React.useMemo(
    () =>
      cartItems
        .filter(
          (cartItem) =>
            cartItem.entityType === 'datafile' &&
            allIds.includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, allIds]
  );

  React.useEffect(() => {
    clearTable();
  }, [clearTable]);

  useAfterMountEffect(() => {
    fetchCount(parseInt(datasetId));
    fetchData(parseInt(datasetId), { startIndex: 0, stopIndex: 49 });
    fetchAllIds();
  }, [fetchCount, fetchData, fetchAllIds, sort, filters, datasetId]);

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: string) => filterTable(dataKey, value ? value : null)}
    />
  );

  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <DateColumnFilter
      label={label}
      onChange={(value: { startDate?: string; endDate?: string } | null) =>
        filterTable(dataKey, value)
      }
    />
  );

  return (
    <Table
      loading={loading}
      data={data}
      loadMoreRows={(params) => fetchData(parseInt(datasetId), params)}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={sortTable}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      detailsPanel={({ rowData }) => {
        const datafileData = rowData as Datafile;
        return (
          <div>
            <Typography>
              <b>{t('datafiles.name')}:</b> {datafileData.NAME}
            </Typography>
            <Typography>
              <b>{t('datafiles.size')}:</b> {formatBytes(datafileData.FILESIZE)}
            </Typography>
            <Typography>
              <b>{t('datafiles.location')}:</b> {datafileData.LOCATION}
            </Typography>
          </div>
        );
      }}
      actions={[
        function downloadButton({ rowData }: TableActionProps) {
          const { ID, LOCATION } = rowData as Datafile;
          if (LOCATION) {
            return (
              <IconButton
                aria-label={t('datafiles.download')}
                key="download"
                onClick={() => {
                  downloadData(ID, LOCATION);
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
          icon: <DescriptionIcon />,
          label: t('datafiles.name'),
          dataKey: 'NAME',
          filterComponent: textFilter,
        },
        {
          icon: <ExploreIcon />,
          label: t('datafiles.location'),
          dataKey: 'LOCATION',
          filterComponent: textFilter,
        },
        {
          icon: <SaveIcon />,
          label: t('datafiles.size'),
          dataKey: 'FILESIZE',
          cellContentRenderer: (props) => {
            return formatBytes(props.cellData);
          },
        },
        {
          icon: <CalendarTodayIcon />,
          label: t('datafiles.modified_time'),
          dataKey: 'MOD_TIME',
          filterComponent: dateFilter,
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>,
  ownProps: DatafileTableProps
): DatafileTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (datasetId: number, offsetParams: IndexRange) =>
    dispatch(fetchDatafiles(datasetId, offsetParams)),
  fetchCount: (datasetId: number) => dispatch(fetchDatafileCount(datasetId)),
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
  clearTable: () => dispatch(clearTable()),
});

const mapStateToProps = (
  state: StateType,
  ownProps: DatafileTableProps
): DatafileTableStoreProps => {
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

export default connect(mapStateToProps, mapDispatchToProps)(DatafileTable);
