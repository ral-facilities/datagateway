import React from 'react';
import {
  TextColumnFilter,
  Table,
  tableLink,
  Order,
  Filter,
  Entity,
  TableActionProps,
  DateColumnFilter,
  Dataset,
  DownloadCartItem,
  formatBytes,
  fetchDatasets,
  fetchDatasetCount,
  fetchDatasetDetails,
  downloadDataset,
  addToCart,
  removeFromCart,
  fetchAllIds,
  sortTable,
  filterTable,
  clearTable,
} from 'datagateway-common';
import { IconButton } from '@material-ui/core';
import { AnyAction } from 'redux';
import { StateType } from '../../state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { connect } from 'react-redux';
import { TableCellProps, IndexRange } from 'react-virtualized';
import DatasetDetailsPanel from '../detailsPanels/datasetDetailsPanel.component';
import useAfterMountEffect from '../../utils';
import { useTranslation } from 'react-i18next';
import GetApp from '@material-ui/icons/GetApp';

import TitleIcon from '@material-ui/icons/Title';
import SaveIcon from '@material-ui/icons/Save';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';

interface ISISDatasetsTableProps {
  instrumentId: string;
  facilityCycleId: string;
  investigationId: string;
}

interface ISISDatasetsTableStoreProps {
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

interface ISISDatasetsTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (
    investigationId: number,
    offsetParams: IndexRange
  ) => Promise<void>;
  fetchCount: (datasetId: number) => Promise<void>;
  clearTable: () => Action;
  fetchDetails: (datasetId: number) => Promise<void>;
  downloadData: (datasetId: number, name: string) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchAllIds: () => Promise<void>;
}

type ISISDatasetsTableCombinedProps = ISISDatasetsTableProps &
  ISISDatasetsTableStoreProps &
  ISISDatasetsTableDispatchProps;

const ISISDatasetsTable = (
  props: ISISDatasetsTableCombinedProps
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
    investigationId,
    facilityCycleId,
    instrumentId,
    downloadData,
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
            cartItem.entityType === 'dataset' &&
            allIds.includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, allIds]
  );

  React.useEffect(() => {
    clearTable();
  }, [clearTable]);

  useAfterMountEffect(() => {
    fetchCount(parseInt(investigationId));
    fetchData(parseInt(investigationId), { startIndex: 0, stopIndex: 49 });
    fetchAllIds();
  }, [fetchCount, fetchData, sort, filters, investigationId, fetchAllIds]);

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
      loadMoreRows={(params) => fetchData(parseInt(investigationId), params)}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={sortTable}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      detailsPanel={({ rowData, detailsPanelResize }) => {
        return (
          <DatasetDetailsPanel
            rowData={rowData}
            detailsPanelResize={detailsPanelResize}
            fetchDetails={props.fetchDetails}
          />
        );
      }}
      actions={[
        function downloadButton({ rowData }: TableActionProps) {
          const datasetData = rowData as Dataset;
          return (
            <IconButton
              aria-label={t('datasets.download')}
              key="download"
              size="small"
              onClick={() => {
                downloadData(datasetData.ID, datasetData.NAME);
              }}
            >
              <GetApp />
            </IconButton>
          );
        },
      ]}
      columns={[
        {
          icon: <TitleIcon />,
          label: t('datasets.name'),
          dataKey: 'NAME',
          cellContentRenderer: (props: TableCellProps) =>
            tableLink(
              `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${investigationId}/dataset/${props.rowData.ID}/datafile`,
              props.rowData.NAME
            ),
          filterComponent: textFilter,
        },
        {
          icon: <SaveIcon />,
          label: t('datasets.size'),
          dataKey: 'SIZE',
          cellContentRenderer: (props) => {
            return formatBytes(props.cellData);
          },
          disableSort: true,
        },
        {
          icon: <CalendarTodayIcon />,
          label: t('datasets.create_time'),
          dataKey: 'CREATE_TIME',
          filterComponent: dateFilter,
        },
        {
          icon: <CalendarTodayIcon />,

          label: t('datasets.modified_time'),
          dataKey: 'MOD_TIME',
          filterComponent: dateFilter,
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>,
  ownProps: ISISDatasetsTableProps
): ISISDatasetsTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (investigationId: number, offsetParams: IndexRange) =>
    dispatch(
      fetchDatasets({
        investigationId,
        offsetParams,
        optionalParams: { getSize: true },
      })
    ),
  fetchCount: (investigationId: number) =>
    dispatch(fetchDatasetCount(investigationId)),
  clearTable: () => dispatch(clearTable()),
  fetchDetails: (datasetId: number) => dispatch(fetchDatasetDetails(datasetId)),
  downloadData: (datasetId: number, name: string) =>
    dispatch(downloadDataset(datasetId, name)),
  addToCart: (entityIds: number[]) => dispatch(addToCart('dataset', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('dataset', entityIds)),
  fetchAllIds: () =>
    dispatch(
      fetchAllIds('dataset', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            INVESTIGATION_ID: { eq: parseInt(ownProps.investigationId) },
          }),
        },
      ])
    ),
});

const mapStateToProps = (state: StateType): ISISDatasetsTableStoreProps => {
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

export default connect(mapStateToProps, mapDispatchToProps)(ISISDatasetsTable);
