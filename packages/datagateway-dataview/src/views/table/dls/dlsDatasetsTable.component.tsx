import {
  addToCart,
  DateColumnFilter,
  DateFilter,
  DownloadCartItem,
  Entity,
  fetchAllIds,
  fetchDatasetCount,
  fetchDatasetDetails,
  fetchDatasets,
  fetchDatasetSize,
  Filter,
  FiltersType,
  Order,
  pushPageFilter,
  pushPageSort,
  removeFromCart,
  SortType,
  Table,
  tableLink,
  TextColumnFilter,
  ViewsType,
  TextFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import DatasetDetailsPanel from '../../detailsPanels/dls/datasetDetailsPanel.component';

import TitleIcon from '@material-ui/icons/Title';
import ConfirmationNumberIcon from '@material-ui/icons/ConfirmationNumber';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';

interface DLSDatasetsTableProps {
  proposalName: string;
  investigationId: string;
}

interface DLSDatasetsTableStoreProps {
  sort: SortType;
  filters: FiltersType;
  view: ViewsType;
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  error: string | null;
  cartItems: DownloadCartItem[];
  allIds: number[];
  selectAllSetting: boolean;
}

interface DLSDatasetsTableDispatchProps {
  pushSort: (sort: string, order: Order | null) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  fetchData: (
    investigationId: number,
    offsetParams: IndexRange
  ) => Promise<void>;
  fetchCount: (datasetId: number) => Promise<void>;
  fetchDetails: (datasetId: number) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchAllIds: () => Promise<void>;
  fetchSize: (investigationId: number) => Promise<void>;
}

type DLSDatasetsTableCombinedProps = DLSDatasetsTableProps &
  DLSDatasetsTableStoreProps &
  DLSDatasetsTableDispatchProps;

const DLSDatasetsTable = (
  props: DLSDatasetsTableCombinedProps
): React.ReactElement => {
  const {
    data,
    totalDataCount,
    fetchData,
    fetchCount,
    sort,
    pushSort,
    filters,
    pushFilters,
    view,
    investigationId,
    proposalName,
    loading,
    cartItems,
    addToCart,
    removeFromCart,
    allIds,
    fetchAllIds,
    selectAllSetting,
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
    fetchCount(parseInt(investigationId));
    fetchAllIds();
  }, [fetchCount, fetchAllIds, filters, investigationId]);

  React.useEffect(() => {
    fetchData(parseInt(investigationId), { startIndex: 0, stopIndex: 49 });
  }, [fetchData, sort, filters, investigationId]);

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      value={filters[dataKey] as TextFilter}
      onChange={(value: { value?: string | number; type: string } | null) =>
        pushFilters(dataKey, value ? value : null)
      }
    />
  );

  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <DateColumnFilter
      label={label}
      value={filters[dataKey] as DateFilter}
      onChange={(value: { startDate?: string; endDate?: string } | null) =>
        pushFilters(dataKey, value ? value : null)
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
      onSort={pushSort}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      disableSelectAll={!selectAllSetting}
      detailsPanel={({ rowData, detailsPanelResize }) => {
        return (
          <DatasetDetailsPanel
            rowData={rowData}
            detailsPanelResize={detailsPanelResize}
            fetchDetails={props.fetchDetails}
            fetchSize={props.fetchSize}
          />
        );
      }}
      columns={[
        {
          icon: <TitleIcon />,
          label: t('datasets.name'),
          dataKey: 'name',
          cellContentRenderer: (cellProps: TableCellProps) =>
            tableLink(
              `/browse/proposal/${proposalName}/investigation/${investigationId}/dataset/${cellProps.rowData.id}/datafile`,
              cellProps.rowData.name,
              view
            ),
          filterComponent: textFilter,
        },
        {
          icon: <ConfirmationNumberIcon />,
          label: t('datasets.datafile_count'),
          dataKey: 'datafileCount',
          disableSort: true,
        },
        {
          icon: <CalendarTodayIcon />,
          label: t('datasets.create_time'),
          dataKey: 'createTime',
          filterComponent: dateFilter,
        },
        {
          icon: <CalendarTodayIcon />,

          label: t('datasets.modified_time'),
          dataKey: 'modTime',
          filterComponent: dateFilter,
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>,
  ownProps: DLSDatasetsTableProps
): DLSDatasetsTableDispatchProps => ({
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  fetchData: (investigationId: number, offsetParams: IndexRange) =>
    dispatch(
      fetchDatasets({
        offsetParams,
        getDatafileCount: true,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              'investigation.id': { eq: investigationId },
            }),
          },
          {
            filterType: 'include',
            filterValue: JSON.stringify('investigation'),
          },
        ],
      })
    ),
  fetchCount: (investigationId: number) =>
    dispatch(
      fetchDatasetCount([
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'investigation.id': { eq: investigationId },
          }),
        },
        {
          filterType: 'include',
          filterValue: JSON.stringify('investigation'),
        },
      ])
    ),
  fetchDetails: (datasetId: number) => dispatch(fetchDatasetDetails(datasetId)),
  addToCart: (entityIds: number[]) => dispatch(addToCart('dataset', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('dataset', entityIds)),
  fetchAllIds: () =>
    dispatch(
      fetchAllIds('dataset', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'investigation.id': { eq: parseInt(ownProps.investigationId) },
          }),
        },
      ])
    ),
  fetchSize: (datasetId: number) => dispatch(fetchDatasetSize(datasetId)),
});

const mapStateToProps = (state: StateType): DLSDatasetsTableStoreProps => {
  return {
    sort: state.dgcommon.query.sort,
    filters: state.dgcommon.query.filters,
    view: state.dgcommon.query.view,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    error: state.dgcommon.error,
    cartItems: state.dgcommon.cartItems,
    allIds: state.dgcommon.allIds,
    selectAllSetting: state.dgdataview.selectAllSetting,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DLSDatasetsTable);
