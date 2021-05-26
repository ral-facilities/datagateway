import React from 'react';
import { Typography } from '@material-ui/core';
import {
  Table,
  TextColumnFilter,
  DateColumnFilter,
  Order,
  Filter,
  Dataset,
  Entity,
  DownloadCartItem,
  fetchDatasets,
  addToCart,
  removeFromCart,
  fetchDatasetCount,
  fetchAllIds,
  sortTable,
  filterTable,
  clearTable,
  tableLink,
  handleICATError,
  readSciGatewayToken,
  FacilityCycle,
} from 'datagateway-common';
import { StateType } from '../state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { Action, AnyAction } from 'redux';
import { connect } from 'react-redux';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

interface DatasetTableStoreProps {
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
  luceneData: number[];
  apiUrl: string;
}

interface DatasetTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (luceneData: number[], offsetParams?: IndexRange) => Promise<void>;
  fetchCount: (luceneData: number[]) => Promise<void>;
  clearTable: () => Action;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchAllIds: (luceneData: number[]) => Promise<void>;
}

type DatasetTableCombinedProps = DatasetTableStoreProps &
  DatasetTableDispatchProps & { hierarchy: string };

const DatasetSearchTable = (
  props: DatasetTableCombinedProps
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
    cartItems,
    addToCart,
    removeFromCart,
    clearTable,
    allIds,
    fetchAllIds,
    loading,
    luceneData,
    hierarchy,
    apiUrl,
  } = props;

  const [facilityCycles, setFacilityCycles] = React.useState([]);

  const [t] = useTranslation();

  const dlsLink = (
    datasetData: Dataset,
    linkType = 'dataset'
  ): React.ReactElement => {
    if (linkType === 'investigation') {
      return tableLink(
        `/browse/proposal/${datasetData.investigation?.name}/investigation/${datasetData.investigation?.id}/dataset`,
        datasetData.investigation?.title
      );
    }
    return tableLink(
      `/browse/proposal/${datasetData.investigation?.name}/investigation/${datasetData.investigation?.id}/dataset/${datasetData.id}/datafile`,
      datasetData.name
    );
  };

  const isisLink = React.useCallback(
    (datasetData: Dataset, linkType = 'dataset') => {
      let instrumentId;
      let facilityCycleId;
      if (datasetData.investigation?.investigationInstruments?.length) {
        instrumentId =
          datasetData.investigation?.investigationInstruments[0].instrument?.id;
      } else {
        return datasetData.name;
      }

      if (datasetData.startDate && facilityCycles.length) {
        const filteredFacilityCycles: FacilityCycle[] = facilityCycles.filter(
          (facilityCycle: FacilityCycle) =>
            datasetData.startDate &&
            facilityCycle.startDate &&
            facilityCycle.endDate &&
            datasetData.startDate >= facilityCycle.startDate &&
            datasetData.startDate <= facilityCycle.endDate
        );
        if (filteredFacilityCycles.length) {
          facilityCycleId = filteredFacilityCycles[0].id;
        }
      }

      if (facilityCycleId) {
        if (linkType === 'investigation') {
          return tableLink(
            `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${datasetData.investigation?.id}/dataset`,
            datasetData.investigation?.title
          );
        }
        return tableLink(
          `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${datasetData.investigation?.id}/dataset/${datasetData.id}`,
          datasetData.name
        );
      } else {
        return datasetData.name;
      }
    },
    [facilityCycles]
  );

  const genericLink = (
    datasetData: Dataset,
    linkType = 'dataset'
  ): React.ReactElement => {
    // generic link for parent investigation
    if (linkType === 'investigation') {
      return tableLink(
        `/browse/investigation/${datasetData.investigation?.id}/dataset`,
        datasetData.investigation?.title
      );
    }
    // generic link for this dataset
    return tableLink(
      `/browse/investigation/${datasetData.investigation?.id}/dataset/${datasetData.id}/datafile`,
      datasetData.name
    );
  };

  const hierarchyLink = React.useMemo(() => {
    if (hierarchy === 'dls') {
      return dlsLink;
    } else if (hierarchy === 'isis') {
      return isisLink;
    } else {
      return genericLink;
    }
  }, [hierarchy, isisLink]);

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

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: { value?: string | number; type: string } | null) =>
        filterTable(dataKey, value ? value : null)
      }
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

  const fetchFacilityCycles = React.useCallback(() => {
    axios
      .get(`${apiUrl}/facilitycycles`, {
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then((response) => {
        setFacilityCycles(response.data);
      })
      .catch((error) => {
        handleICATError(error);
      });
  }, [apiUrl]);

  React.useEffect(() => {
    if (hierarchy === 'isis') fetchFacilityCycles();
  }, [fetchFacilityCycles, hierarchy]);

  React.useEffect(() => {
    clearTable();
  }, [clearTable, luceneData]);

  React.useEffect(() => {
    fetchCount(luceneData);
    fetchAllIds(luceneData);
  }, [fetchCount, fetchData, fetchAllIds, filters, luceneData]);

  React.useEffect(() => {
    fetchData(luceneData, { startIndex: 0, stopIndex: 49 });
  }, [fetchCount, fetchData, fetchAllIds, sort, filters, luceneData]);

  return (
    <Table
      loading={loading}
      data={data}
      loadMoreRows={(params) => fetchData(luceneData, params)}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={sortTable}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      detailsPanel={({ rowData }) => {
        const datasetData = rowData as Dataset;
        return (
          <div>
            <Typography>
              <b>{t('datasets.name')}:</b> {datasetData.name}
            </Typography>
            <Typography>
              <b>{t('datasets.description')}:</b> {datasetData.name}
            </Typography>
          </div>
        );
      }}
      columns={[
        {
          label: t('datasets.name'),
          dataKey: 'name',
          cellContentRenderer: (cellProps: TableCellProps) => {
            const datasetData = cellProps.rowData as Dataset;
            return hierarchyLink(datasetData);
          },
          filterComponent: textFilter,
        },
        {
          label: t('datasets.datafile_count'),
          dataKey: 'datafileCount',
          disableSort: true,
        },
        {
          label: t('datasets.investigation'),
          dataKey: 'investigation',
          cellContentRenderer: (cellProps: TableCellProps) => {
            const datasetData = cellProps.rowData as Dataset;
            return hierarchyLink(datasetData, 'investigation');
          },
          filterComponent: textFilter,
        },
        {
          label: t('datasets.create_time'),
          dataKey: 'createTime',
          filterComponent: dateFilter,
          disableHeaderWrap: true,
        },
        {
          label: t('datasets.modified_time'),
          dataKey: 'modTime',
          filterComponent: dateFilter,
          disableHeaderWrap: true,
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): DatasetTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (luceneData: number[], offsetParams?: IndexRange) =>
    dispatch(
      fetchDatasets({
        offsetParams,
        getDatafileCount: true,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              id: { in: luceneData },
            }),
          },
          {
            filterType: 'include',
            filterValue: 'investigation',
          },
        ],
      })
    ),
  fetchCount: (luceneData: number[]) =>
    dispatch(
      fetchDatasetCount([
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            id: { in: luceneData },
          }),
        },
      ])
    ),
  clearTable: () => dispatch(clearTable()),
  addToCart: (entityIds: number[]) => dispatch(addToCart('dataset', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('dataset', entityIds)),
  fetchAllIds: (luceneData: number[]) =>
    dispatch(
      fetchAllIds('dataset', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            id: { in: luceneData },
          }),
        },
      ])
    ),
});

const mapStateToProps = (state: StateType): DatasetTableStoreProps => {
  return {
    sort: state.dgcommon.query.sort,
    filters: state.dgcommon.query.filters,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    error: state.dgcommon.error,
    cartItems: state.dgcommon.cartItems,
    allIds: state.dgcommon.allIds,
    luceneData: state.dgsearch.searchData.dataset,
    apiUrl: state.dgcommon.urls.apiUrl,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DatasetSearchTable);
