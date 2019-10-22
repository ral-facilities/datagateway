import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import {
  Table,
  TextColumnFilter,
  DateColumnFilter,
  investigationLink,
  Order,
  Filter,
  Investigation,
  Entity,
  DownloadCartItem,
} from 'datagateway-common';
import { StateType } from '../state/app.types';
import { connect } from 'react-redux';
import { Action, AnyAction } from 'redux';
import { TableCellProps } from 'react-virtualized';
import { ThunkDispatch } from 'redux-thunk';
import {
  sortTable,
  filterTable,
  fetchInvestigations,
  addToCart,
  removeFromCart,
} from '../state/actions';

interface InvestigationTableProps {
  sort: {
    [column: string]: Order;
  };
  filters: {
    [column: string]: Filter;
  };
  data: Entity[];
  loading: boolean;
  error: string | null;
  cartItems: DownloadCartItem[];
}

interface InvestigationTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: () => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
}

type InvestigationTableCombinedProps = InvestigationTableProps &
  InvestigationTableDispatchProps;

const InvestigationTable = (
  props: InvestigationTableCombinedProps
): React.ReactElement => {
  const {
    data,
    fetchData,
    sort,
    sortTable,
    filters,
    filterTable,
    cartItems,
    addToCart,
    removeFromCart,
  } = props;

  const selectedRows = React.useMemo(
    () =>
      cartItems
        .filter(
          cartItem =>
            cartItem.entityType === 'investigation' &&
            data.some(entity => entity.ID === cartItem.entityId)
        )
        .map(cartItem => cartItem.entityId),
    [cartItems, data]
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
    fetchData();
  }, [fetchData, sort, filters]);

  return (
    <Paper style={{ height: 'calc(100vh - 64px)', width: '100%' }}>
      <Table
        data={data}
        sort={sort}
        onSort={sortTable}
        selectedRows={selectedRows}
        onCheck={addToCart}
        onUncheck={removeFromCart}
        detailsPanel={({ rowData }) => {
          const investigationData = rowData as Investigation;
          return (
            <div>
              <Typography>
                <b>Proposal:</b> {investigationData.RB_NUMBER}
              </Typography>
              <Typography>
                <b>Title:</b> {investigationData.TITLE}
              </Typography>
              <Typography>
                <b>Start Date:</b> {investigationData.STARTDATE}
              </Typography>
              <Typography>
                <b>End Date:</b> {investigationData.ENDDATE}
              </Typography>
            </div>
          );
        }}
        columns={[
          {
            label: 'Title',
            dataKey: 'TITLE',
            cellContentRenderer: (props: TableCellProps) => {
              const investigationData = props.rowData as Investigation;
              return investigationLink(
                investigationData.ID,
                investigationData.TITLE
              );
            },
            filterComponent: textFilter,
          },
          {
            label: 'Visit ID',
            dataKey: 'VISIT_ID',
            filterComponent: textFilter,
          },
          {
            label: 'RB Number',
            dataKey: 'RB_NUMBER',
            filterComponent: textFilter,
          },
          {
            label: 'DOI',
            dataKey: 'DOI',
            filterComponent: textFilter,
          },
          {
            label: 'Dataset Count',
            dataKey: 'DATASET_COUNT',
          },
          {
            label: 'Instrument',
            dataKey: 'INSTRUMENT.NAME',
            filterComponent: textFilter,
          },
          {
            label: 'Start Date',
            dataKey: 'STARTDATE',
            filterComponent: dateFilter,
            cellContentRenderer: (props: TableCellProps) => {
              if (props.cellData)
                return props.cellData.toString().split(' ')[0];
            },
          },
          {
            label: 'End Date',
            dataKey: 'ENDDATE',
            filterComponent: dateFilter,
            cellContentRenderer: (props: TableCellProps) => {
              if (props.cellData)
                return props.cellData.toString().split(' ')[0];
            },
          },
        ]}
      />
    </Paper>
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): InvestigationTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: () => dispatch(fetchInvestigations()),
  addToCart: (entityIds: number[]) =>
    dispatch(addToCart('investigation', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('investigation', entityIds)),
});

const mapStateToProps = (state: StateType): InvestigationTableProps => {
  return {
    sort: state.dgtable.sort,
    filters: state.dgtable.filters,
    data: state.dgtable.data,
    loading: state.dgtable.loading,
    error: state.dgtable.error,
    cartItems: state.dgtable.cartItems,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InvestigationTable);
