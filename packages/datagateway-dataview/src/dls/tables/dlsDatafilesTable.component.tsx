import React from 'react';
import {
  TextColumnFilter,
  Table,
  formatBytes,
  Filter,
  Order,
  Entity,
  Datafile,
  DateColumnFilter,
  DownloadCartItem,
  fetchDatafiles,
  fetchDatafileCount,
  addToCart,
  removeFromCart,
  fetchAllIds,
  sortTable,
  filterTable,
  clearTable,
} from 'datagateway-common';
import { Typography } from '@material-ui/core';
import { ThunkDispatch } from 'redux-thunk';
import { connect } from 'react-redux';
import { StateType } from '../../state/app.types';
import { Action, AnyAction } from 'redux';
import { IndexRange } from 'react-virtualized';
import useAfterMountEffect from '../../utils';
import { useTranslation } from 'react-i18next';

import TitleIcon from '@material-ui/icons/Title';
import ExploreIcon from '@material-ui/icons/Explore';
import SaveIcon from '@material-ui/icons/Save';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';

interface DLSDatafilesTableProps {
  datasetId: string;
}

interface DLSDatafilesTableStoreProps {
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

interface DLSDatafilesTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (datasetId: number, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (datasetId: number) => Promise<void>;
  clearTable: () => Action;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchAllIds: () => Promise<void>;
}

type DLSDatafilesTableCombinedProps = DLSDatafilesTableProps &
  DLSDatafilesTableStoreProps &
  DLSDatafilesTableDispatchProps;

const DLSDatafilesTable = (
  props: DLSDatafilesTableCombinedProps
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
    filterTable,
    datasetId,
    loading,
    cartItems,
    addToCart,
    removeFromCart,
    allIds,
    fetchAllIds,
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
  }, [fetchCount, fetchData, sort, filters, datasetId, fetchAllIds]);

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
            <Typography variant="body2">
              <b>{t('datafiles.name')}:</b> {datafileData.NAME}
            </Typography>
            <Typography variant="body2">
              <b>{t('datafiles.description')}:</b> {datafileData.DESCRIPTION}
            </Typography>
            <Typography variant="body2">
              <b>{t('datafiles.size')}:</b> {formatBytes(datafileData.FILESIZE)}
            </Typography>
            <Typography variant="body2">
              <b>{t('datafiles.location')}:</b> {datafileData.LOCATION}
            </Typography>
          </div>
        );
      }}
      columns={[
        {
          icon: <TitleIcon />,
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
          filterComponent: textFilter,
        },
        {
          icon: <CalendarTodayIcon />,
          label: t('datafiles.create_time'),
          dataKey: 'CREATE_TIME',
          filterComponent: dateFilter,
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>,
  ownProps: DLSDatafilesTableProps
): DLSDatafilesTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (datasetId: number, offsetParams: IndexRange) =>
    dispatch(
      fetchDatafiles({
        offsetParams,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({ DATASET_ID: { eq: datasetId } }),
          },
        ],
      })
    ),
  fetchCount: (datasetId: number) =>
    dispatch(
      fetchDatafileCount([
        {
          filterType: 'where',
          filterValue: JSON.stringify({ DATASET_ID: { eq: datasetId } }),
        },
      ])
    ),
  clearTable: () => dispatch(clearTable()),
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

const mapStateToProps = (state: StateType): DLSDatafilesTableStoreProps => {
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

export default connect(mapStateToProps, mapDispatchToProps)(DLSDatafilesTable);
