import React from 'react';
import { Typography } from '@material-ui/core';
import {
  Table,
  TextColumnFilter,
  DateColumnFilter,
  Order,
  Filter,
  Investigation,
  Entity,
  DownloadCartItem,
  fetchInvestigations,
  fetchInvestigationCount,
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
import { StateType } from '../state/app.types';
import { connect } from 'react-redux';
import { Action, AnyAction } from 'redux';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { ThunkDispatch } from 'redux-thunk';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

interface InvestigationTableProps {
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

interface InvestigationTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchData: (luceneData: number[], offsetParams: IndexRange) => Promise<void>;
  fetchCount: (luceneData: number[]) => Promise<void>;
  fetchAllIds: (luceneData: number[]) => Promise<void>;
  clearTable: () => Action;
}

type InvestigationTableCombinedProps = InvestigationTableProps &
  InvestigationTableDispatchProps & { hierarchy: string };

const InvestigationSearchTable = (
  props: InvestigationTableCombinedProps
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
    cartItems,
    addToCart,
    removeFromCart,
    allIds,
    fetchAllIds,
    luceneData,
    loading,
    hierarchy,
    apiUrl,
  } = props;

  const [facilityCycles, setFacilityCycles] = React.useState([]);

  const [t] = useTranslation();

  const dlsLink = (investigationData: Investigation): React.ReactElement =>
    tableLink(
      `/browse/proposal/${investigationData.name}/investigation/${investigationData.id}/dataset`,
      investigationData.title
    );

  const isisLink = React.useCallback(
    (investigationData: Investigation) => {
      let instrumentId;
      let facilityCycleId;
      if (investigationData.investigationInstruments?.length) {
        instrumentId =
          investigationData.investigationInstruments[0].instrument?.id;
      } else {
        return investigationData.title;
      }

      if (investigationData.startDate && facilityCycles.length) {
        const filteredFacilityCycles: FacilityCycle[] = facilityCycles.filter(
          (facilityCycle: FacilityCycle) =>
            investigationData.startDate &&
            facilityCycle.startDate &&
            facilityCycle.endDate &&
            investigationData.startDate >= facilityCycle.startDate &&
            investigationData.startDate <= facilityCycle.endDate
        );
        if (filteredFacilityCycles.length) {
          facilityCycleId = filteredFacilityCycles[0].id;
        }
      }

      if (facilityCycleId) {
        return tableLink(
          `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${investigationData.id}/dataset`,
          investigationData.title
        );
      } else {
        return investigationData.title;
      }
    },
    [facilityCycles]
  );

  const genericLink = (investigationData: Investigation): React.ReactElement =>
    tableLink(
      `/browse/investigation/${investigationData.id}/dataset`,
      investigationData.title
    );

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
            cartItem.entityType === 'investigation' &&
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
        const investigationData = rowData as Investigation;
        return (
          <div>
            <Typography>
              <b>{t('investigations.name')}:</b> {investigationData.name}
            </Typography>
            <Typography>
              <b>{t('investigations.title')}:</b> {investigationData.title}
            </Typography>
            <Typography>
              <b>{t('investigations.start_date')}:</b>{' '}
              {investigationData.startDate}
            </Typography>
            <Typography>
              <b>{t('investigations.end_date')}:</b> {investigationData.endDate}
            </Typography>
          </div>
        );
      }}
      columns={[
        {
          label: t('investigations.title'),
          dataKey: 'title',
          cellContentRenderer: (cellProps: TableCellProps) => {
            const investigationData = cellProps.rowData as Investigation;
            return hierarchyLink(investigationData);
          },
          filterComponent: textFilter,
        },
        {
          label: t('investigations.visit_id'),
          dataKey: 'visitId',
          filterComponent: textFilter,
        },
        {
          label: t('investigations.name'),
          dataKey: 'name',
          filterComponent: textFilter,
        },
        {
          label: t('investigations.doi'),
          dataKey: 'doi',
          filterComponent: textFilter,
        },
        {
          label: t('investigations.dataset_count'),
          dataKey: 'datasetCount',
          disableSort: true,
        },
        {
          label: t('investigations.instrument'),
          dataKey: 'investigationInstruments.instrument.fullName',
          cellContentRenderer: (cellProps: TableCellProps) => {
            const investigationData = cellProps.rowData as Investigation;
            if (investigationData?.investigationInstruments?.[0]?.instrument) {
              return investigationData.investigationInstruments[0].instrument
                .fullName;
            } else {
              return '';
            }
          },
          filterComponent: textFilter,
        },
        {
          label: t('investigations.start_date'),
          dataKey: 'startDate',
          filterComponent: dateFilter,
          cellContentRenderer: (cellProps: TableCellProps) => {
            if (cellProps.cellData) {
              return cellProps.cellData.toString().split(' ')[0];
            }
          },
        },
        {
          label: t('investigations.end_date'),
          dataKey: 'endDate',
          filterComponent: dateFilter,
          cellContentRenderer: (cellProps: TableCellProps) => {
            if (cellProps.cellData) {
              return cellProps.cellData.toString().split(' ')[0];
            }
          },
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): InvestigationTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (luceneData: number[], offsetParams?: IndexRange) =>
    dispatch(
      fetchInvestigations({
        offsetParams,
        getDatasetCount: true,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              id: { in: luceneData },
            }),
          },
          {
            filterType: 'include',
            filterValue: JSON.stringify([
              { investigationInstruments: 'instrument' },
            ]),
          },
        ],
      })
    ),
  fetchCount: (luceneData: number[]) =>
    dispatch(
      fetchInvestigationCount([
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            id: { in: luceneData },
          }),
        },
      ])
    ),
  clearTable: () => dispatch(clearTable()),
  addToCart: (entityIds: number[]) =>
    dispatch(addToCart('investigation', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('investigation', entityIds)),
  fetchAllIds: (luceneData: number[]) =>
    dispatch(
      fetchAllIds('investigation', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            id: { in: luceneData },
          }),
        },
      ])
    ),
});

const mapStateToProps = (state: StateType): InvestigationTableProps => {
  return {
    sort: state.dgcommon.query.sort,
    filters: state.dgcommon.query.filters,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    error: state.dgcommon.error,
    cartItems: state.dgcommon.cartItems,
    allIds: state.dgcommon.allIds,
    luceneData: state.dgsearch.searchData.investigation,
    apiUrl: state.dgcommon.urls.apiUrl,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InvestigationSearchTable);
