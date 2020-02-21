import React from 'react';
import {
  TextColumnFilter,
  Table,
  tableLink,
  Order,
  Filter,
  Entity,
  Investigation,
  DateColumnFilter,
  DownloadCartItem,
  formatBytes,
  fetchInvestigationDetails,
  fetchInvestigations,
  fetchInvestigationCount,
  addToCart,
  removeFromCart,
  sortTable,
  filterTable,
  clearTable,
  fetchAllIds,
  readSciGatewayToken,
} from 'datagateway-common';
import { StateType } from '../../state/app.types';
import { connect } from 'react-redux';
import { Action, AnyAction } from 'redux';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { ThunkDispatch } from 'redux-thunk';
import InvestigationDetailsPanel from '../detailsPanels/investigationDetailsPanel.component';
import useAfterMountEffect from '../../utils';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISMyDataTableStoreProps {
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
interface ISISMyDataTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (username: string, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (username: string) => Promise<void>;
  clearTable: () => Action;
  fetchDetails: (investigationId: number) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchAllIds: (username: string) => Promise<void>;
}

type ISISMyDataTableCombinedProps = ISISMyDataTableStoreProps &
  ISISMyDataTableDispatchProps;

const ISISMyDataTable = (
  props: ISISMyDataTableCombinedProps
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
    loading,
    cartItems,
    addToCart,
    removeFromCart,
    allIds,
    fetchAllIds,
  } = props;

  const username = readSciGatewayToken().username || '';

  const selectedRows = React.useMemo(
    () =>
      cartItems
        .filter(
          cartItem =>
            cartItem.entityType === 'investigation' &&
            allIds.includes(cartItem.entityId)
        )
        .map(cartItem => cartItem.entityId),
    [cartItems, allIds]
  );

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

  React.useEffect(() => {
    clearTable();
    sortTable('STARTDATE', 'desc');
  }, [clearTable, sortTable]);

  useAfterMountEffect(() => {
    fetchCount(username);
    fetchData(username, {
      startIndex: 0,
      stopIndex: 49,
    });
    fetchAllIds(username);
  }, [fetchData, username, sort, filters, fetchAllIds]);

  return (
    <Table
      loading={loading}
      data={data}
      loadMoreRows={params => fetchData(username, params)}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={sortTable}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      detailsPanel={({ rowData, detailsPanelResize }) => {
        return (
          <InvestigationDetailsPanel
            rowData={rowData}
            detailsPanelResize={detailsPanelResize}
            fetchDetails={props.fetchDetails}
          />
        );
      }}
      columns={[
        {
          label: 'Title',
          dataKey: 'TITLE',
          cellContentRenderer: (props: TableCellProps) => {
            const investigationData = props.rowData as Investigation;
            if (
              investigationData.INVESTIGATIONINSTRUMENT &&
              investigationData.INVESTIGATIONINSTRUMENT[0].INSTRUMENT &&
              investigationData.FACILITY &&
              investigationData.FACILITY.FACILITYCYCLE
            ) {
              const facilityCycle = investigationData.FACILITY.FACILITYCYCLE.find(
                facilitycycle =>
                  facilitycycle.STARTDATE &&
                  facilitycycle.ENDDATE &&
                  investigationData.STARTDATE &&
                  facilitycycle.STARTDATE <= investigationData.STARTDATE &&
                  facilitycycle.ENDDATE >= investigationData.STARTDATE
              );
              if (facilityCycle)
                return tableLink(
                  `/browse/instrument/${investigationData.INVESTIGATIONINSTRUMENT[0].INSTRUMENT.ID}/facilityCycle/${facilityCycle.ID}/investigation/${investigationData.ID}/dataset`,
                  investigationData.TITLE
                );
            }
          },
        },
        {
          label: 'DOI',
          dataKey: 'STUDYINVESTIGATION.STUDY.PID',
          cellContentRenderer: (props: TableCellProps) => {
            const investigationData = props.rowData as Investigation;
            if (
              investigationData.STUDYINVESTIGATION &&
              investigationData.STUDYINVESTIGATION[0].STUDY
            ) {
              return investigationData.STUDYINVESTIGATION[0].STUDY.PID;
            } else {
              return '';
            }
          },
          filterComponent: textFilter,
        },
        {
          label: 'Visit Id',
          dataKey: 'VISIT_ID',
          filterComponent: textFilter,
        },
        {
          label: 'RB Number',
          dataKey: 'NAME',
          cellContentRenderer: (props: TableCellProps) => {
            const investigationData = props.rowData as Investigation;
            if (
              investigationData.INVESTIGATIONINSTRUMENT &&
              investigationData.INVESTIGATIONINSTRUMENT[0].INSTRUMENT &&
              investigationData.FACILITY &&
              investigationData.FACILITY.FACILITYCYCLE
            ) {
              const facilityCycle = investigationData.FACILITY.FACILITYCYCLE.find(
                facilitycycle =>
                  facilitycycle.STARTDATE &&
                  facilitycycle.ENDDATE &&
                  investigationData.STARTDATE &&
                  facilitycycle.STARTDATE <= investigationData.STARTDATE &&
                  facilitycycle.ENDDATE >= investigationData.STARTDATE
              );
              if (facilityCycle)
                return tableLink(
                  `/browse/instrument/${investigationData.INVESTIGATIONINSTRUMENT[0].INSTRUMENT.ID}/facilityCycle/${facilityCycle.ID}/investigation/${investigationData.ID}/dataset`,
                  investigationData.TITLE
                );
            }
          },
          filterComponent: textFilter,
        },
        {
          label: 'Instrument',
          dataKey: 'INVESTIGATIONINSTRUMENT.INSTRUMENT.FULLNAME',
          cellContentRenderer: (props: TableCellProps) => {
            const investigationData = props.rowData as Investigation;
            if (
              investigationData.INVESTIGATIONINSTRUMENT &&
              investigationData.INVESTIGATIONINSTRUMENT[0].INSTRUMENT
            ) {
              return investigationData.INVESTIGATIONINSTRUMENT[0].INSTRUMENT
                .FULLNAME;
            } else {
              return '';
            }
          },
          filterComponent: textFilter,
        },
        {
          label: 'Size',
          dataKey: 'SIZE',
          cellContentRenderer: props => {
            return formatBytes(props.cellData);
          },
          disableSort: true,
        },
        {
          label: 'Start Date',
          dataKey: 'STARTDATE',
          filterComponent: dateFilter,
        },
        {
          label: 'End Date',
          dataKey: 'ENDDATE',
          filterComponent: dateFilter,
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): ISISMyDataTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (username: string, offsetParams: IndexRange) =>
    dispatch(
      fetchInvestigations({
        offsetParams,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              'INVESTIGATIONUSER.USER.NAME': { eq: username },
            }),
          },
          {
            filterType: 'include',
            filterValue: JSON.stringify([
              {
                INVESTIGATIONINSTRUMENT: 'INSTRUMENT',
              },
              { INVESTIGATIONUSER: 'USER_' },
              { STUDYINVESTIGATION: 'STUDY' },
              { FACILITY: 'FACILITYCYCLE' },
            ]),
          },
        ],
        getSize: true,
      })
    ),
  fetchCount: (username: string) =>
    dispatch(
      fetchInvestigationCount([
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'INVESTIGATIONUSER.USER.NAME': { eq: username },
          }),
        },
        {
          filterType: 'include',
          filterValue: JSON.stringify({ INVESTIGATIONUSER: 'USER_' }),
        },
      ])
    ),
  clearTable: () => dispatch(clearTable()),
  fetchDetails: (investigationId: number) =>
    dispatch(fetchInvestigationDetails(investigationId)),
  addToCart: (entityIds: number[]) =>
    dispatch(addToCart('investigation', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('investigation', entityIds)),
  fetchAllIds: (username: string) =>
    dispatch(
      fetchAllIds('investigation', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'INVESTIGATIONUSER.USER.NAME': { eq: username },
          }),
        },
        {
          filterType: 'include',
          filterValue: JSON.stringify({ INVESTIGATIONUSER: 'USER_' }),
        },
      ])
    ),
});

const mapStateToProps = (state: StateType): ISISMyDataTableStoreProps => {
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

export default connect(mapStateToProps, mapDispatchToProps)(ISISMyDataTable);
