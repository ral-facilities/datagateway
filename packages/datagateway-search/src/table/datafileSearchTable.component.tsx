import React from 'react';
import { Typography } from '@material-ui/core';
import {
  Table,
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
  tableLink,
  handleICATError,
  readSciGatewayToken,
  FacilityCycle,
} from 'datagateway-common';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { connect } from 'react-redux';
import { StateType } from '../state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { Action, AnyAction } from 'redux';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

interface DatafileSearchTableStoreProps {
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
  requestReceived: boolean;
  apiUrl: string;
}

interface DatafileSearchTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (luceneData: number[], offsetParams: IndexRange) => Promise<void>;
  fetchCount: (luceneData: number[]) => Promise<void>;
  downloadData: (datafileId: number, filename: string) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchAllIds: (luceneData: number[]) => Promise<void>;
  clearTable: () => Action;
}

type DatafileSearchTableCombinedProps = DatafileSearchTableStoreProps &
  DatafileSearchTableDispatchProps & { hierarchy: string };

const DatafileSearchTable = (
  props: DatafileSearchTableCombinedProps
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
    // downloadData,
    cartItems,
    addToCart,
    removeFromCart,
    clearTable,
    allIds,
    luceneData,
    fetchAllIds,
    loading,
    hierarchy,
    apiUrl,
  } = props;

  const [facilityCycles, setFacilityCycles] = React.useState([]);

  const [t] = useTranslation();

  const dlsLink = (
    datafileData: Datafile,
    linkType = 'datafile'
  ): React.ReactElement | string => {
    if (datafileData.dataset?.investigation) {
      return linkType === 'dataset'
        ? tableLink(
            `/browse/proposal/${datafileData.dataset.investigation.name}/investigation/${datafileData.dataset.investigation?.id}/dataset/${datafileData.dataset.id}/datafile`,
            datafileData.dataset.name
          )
        : tableLink(
            `/browse/proposal/${datafileData.dataset.name}/investigation/${datafileData.dataset.investigation.id}/dataset/${datafileData.dataset.id}/datafile`,
            datafileData.name
          );
    }
    if (linkType === 'dataset')
      return datafileData.dataset ? datafileData.dataset.name : '';
    return datafileData.name;
  };

  const isisLink = React.useCallback(
    (datafileData: Datafile, linkType = 'datafile') => {
      let instrumentId;
      let facilityCycleId;
      if (
        datafileData.dataset?.investigation?.investigationInstruments?.length
      ) {
        instrumentId =
          datafileData.dataset?.investigation?.investigationInstruments[0]
            .instrument?.id;
      } else {
        if (linkType === 'dataset')
          return datafileData.dataset ? datafileData.dataset.name : '';
        return datafileData.name;
      }

      if (datafileData.dataset.startDate && facilityCycles.length) {
        const filteredFacilityCycles: FacilityCycle[] = facilityCycles.filter(
          (facilityCycle: FacilityCycle) =>
            datafileData.dataset?.startDate &&
            facilityCycle.startDate &&
            facilityCycle.endDate &&
            datafileData.dataset?.startDate >= facilityCycle.startDate &&
            datafileData.dataset?.startDate <= facilityCycle.endDate
        );
        if (filteredFacilityCycles.length) {
          facilityCycleId = filteredFacilityCycles[0].id;
        }
      }

      if (facilityCycleId) {
        return linkType === 'dataset'
          ? tableLink(
              `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${datafileData.dataset.investigation.id}/dataset/${datafileData.dataset.id}`,
              datafileData.dataset?.name
            )
          : tableLink(
              `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${datafileData.dataset.investigation.id}/dataset/${datafileData.dataset.id}/datafile`,
              datafileData.name
            );
      }
      return linkType === 'dataset' ? '' : datafileData.name;
    },
    [facilityCycles]
  );

  const genericLink = (
    datafileData: Datafile,
    linkType = 'datafile'
  ): React.ReactElement | string => {
    if (datafileData.dataset?.investigation) {
      return linkType === 'dataset'
        ? tableLink(
            `/browse/investigation/${datafileData.dataset.investigation.id}/dataset/${datafileData.dataset.id}/datafile`,
            datafileData.dataset.name
          )
        : tableLink(
            `/browse/investigation/${datafileData.dataset.investigation.id}/dataset/${datafileData.dataset.id}/datafile`,
            datafileData.name
          );
    }

    if (linkType === 'dataset')
      return datafileData.dataset ? datafileData.dataset.name : '';
    return datafileData.name;
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
            cartItem.entityType === 'datafile' &&
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
        const datafileData = rowData as Datafile;
        return (
          <div>
            <Typography>
              <b>{t('datafiles.name')}:</b> {datafileData.name}
            </Typography>
            <Typography>
              <b>{t('datafiles.size')}:</b> {formatBytes(datafileData.fileSize)}
            </Typography>
            <Typography>
              <b>{t('datafiles.location')}:</b> {datafileData.location}
            </Typography>
          </div>
        );
      }}
      columns={[
        {
          label: t('datafiles.name'),
          dataKey: 'name',
          cellContentRenderer: (cellProps: TableCellProps) => {
            const datafileData = cellProps.rowData as Datafile;
            return hierarchyLink(datafileData);
          },
          filterComponent: textFilter,
        },
        {
          label: t('datafiles.location'),
          dataKey: 'location',
          filterComponent: textFilter,
        },
        {
          label: t('datafiles.size'),
          dataKey: 'fileSize',
          cellContentRenderer: (cellProps) => {
            return formatBytes(cellProps.cellData);
          },
        },
        {
          label: t('datafiles.dataset'),
          dataKey: 'dataset',
          cellContentRenderer: (cellProps: TableCellProps) => {
            const datafileData = cellProps.rowData as Datafile;
            return hierarchyLink(datafileData, 'dataset');
          },
          filterComponent: textFilter,
        },
        {
          label: t('datafiles.modified_time'),
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
): DatafileSearchTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (luceneData: number[], offsetParams?: IndexRange) =>
    dispatch(
      fetchDatafiles({
        offsetParams,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              id: { in: luceneData },
            }),
          },
          {
            filterType: 'include',
            filterValue: 'dataset',
          },
        ],
      })
    ),
  fetchCount: (luceneData: number[]) =>
    dispatch(
      fetchDatafileCount([
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            id: { in: luceneData },
          }),
        },
      ])
    ),
  downloadData: (datafileId: number, filename: string) =>
    dispatch(downloadDatafile(datafileId, filename)),
  addToCart: (entityIds: number[]) =>
    dispatch(addToCart('datafile', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('datafile', entityIds)),
  fetchAllIds: (luceneData: number[]) =>
    dispatch(
      fetchAllIds('datafile', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            id: { in: luceneData },
          }),
        },
      ])
    ),
  clearTable: () => dispatch(clearTable()),
});

const mapStateToProps = (state: StateType): DatafileSearchTableStoreProps => {
  return {
    sort: state.dgcommon.query.sort,
    filters: state.dgcommon.query.filters,
    data: state.dgcommon.data,
    luceneData: state.dgsearch.searchData.datafile,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    error: state.dgcommon.error,
    cartItems: state.dgcommon.cartItems,
    allIds: state.dgcommon.allIds,
    requestReceived: state.dgsearch.requestReceived,
    apiUrl: state.dgcommon.urls.apiUrl,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DatafileSearchTable);
