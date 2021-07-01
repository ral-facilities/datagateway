import React from 'react';
import {
  TextColumnFilter,
  TextFilter,
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
  pushPageFilter,
  pushPageSort,
  FiltersType,
  SortType,
  DateFilter,
  ViewsType,
} from 'datagateway-common';
import { IconButton } from '@material-ui/core';
import { Action, AnyAction } from 'redux';
import { StateType } from '../../../state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { connect } from 'react-redux';
import { TableCellProps, IndexRange } from 'react-virtualized';
import DatasetDetailsPanel from '../../detailsPanels/isis/datasetDetailsPanel.component';
import { useTranslation } from 'react-i18next';
import GetApp from '@material-ui/icons/GetApp';

import TitleIcon from '@material-ui/icons/Title';
import SaveIcon from '@material-ui/icons/Save';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import { push } from 'connected-react-router';

interface ISISDatasetsTableProps {
  instrumentId: string;
  instrumentChildId: string;
  investigationId: string;
  studyHierarchy: boolean;
}

interface ISISDatasetsTableStoreProps {
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

interface ISISDatasetsTableDispatchProps {
  pushSort: (sort: string, order: Order | null) => Promise<void>;

  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  fetchData: (
    investigationId: number,
    offsetParams: IndexRange
  ) => Promise<void>;
  fetchCount: (datasetId: number) => Promise<void>;

  fetchDetails: (datasetId: number) => Promise<void>;
  downloadData: (datasetId: number, name: string) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchAllIds: () => Promise<void>;
  viewDatafiles: (urlPrefix: string) => (id: number) => Action;
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
    sort,
    pushSort,
    filters,
    pushFilters,
    view,
    investigationId,
    instrumentChildId,
    instrumentId,
    downloadData,
    loading,
    cartItems,
    addToCart,
    removeFromCart,
    allIds,
    fetchAllIds,
    viewDatafiles,
    selectAllSetting,
    studyHierarchy,
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

  const pathRoot = studyHierarchy ? 'browseStudyHierarchy' : 'browse';
  const instrumentChild = studyHierarchy ? 'study' : 'facilityCycle';
  const urlPrefix = `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${instrumentChildId}/investigation/${investigationId}/dataset`;

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
            viewDatafiles={viewDatafiles(urlPrefix)}
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
                downloadData(datasetData.id, datasetData.name);
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
          dataKey: 'name',
          cellContentRenderer: (cellProps: TableCellProps) =>
            tableLink(
              `${urlPrefix}/${cellProps.rowData.id}`,
              cellProps.rowData.name,
              view
            ),
          filterComponent: textFilter,
        },
        {
          icon: <SaveIcon />,
          label: t('datasets.size'),
          dataKey: 'size',
          cellContentRenderer: (cellProps) => {
            return formatBytes(cellProps.cellData);
          },
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
  ownProps: ISISDatasetsTableProps
): ISISDatasetsTableDispatchProps => ({
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  fetchData: (investigationId: number, offsetParams: IndexRange) =>
    dispatch(
      fetchDatasets({
        offsetParams,
        getSize: true,
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
            'investigation.id': { eq: parseInt(ownProps.investigationId) },
          }),
        },
      ])
    ),
  viewDatafiles: (urlPrefix: string) => {
    return (id: number) => {
      return dispatch(push(`${urlPrefix}/${id}/datafile`));
    };
  },
});

const mapStateToProps = (state: StateType): ISISDatasetsTableStoreProps => {
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

export default connect(mapStateToProps, mapDispatchToProps)(ISISDatasetsTable);
