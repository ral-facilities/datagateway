import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import {
  Table,
  TextColumnFilter,
  formatBytes,
  investigationLink,
  Order,
  Filter,
  Investigation,
  Entity,
} from 'datagateway-common';
import { StateType } from '../state/app.types';
import { connect } from 'react-redux';
import { Action, AnyAction } from 'redux';
import { TableCellProps } from 'react-virtualized';
import { ThunkDispatch } from 'redux-thunk';
import { sortTable, filterTable, fetchInvestigations } from '../state/actions';

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
}

interface InvestigationTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: () => Promise<void>;
}

type InvestigationTableCombinedProps = InvestigationTableProps &
  InvestigationTableDispatchProps;

const InvestigationTable = (
  props: InvestigationTableCombinedProps
): React.ReactElement => {
  const { data, fetchData, sort, sortTable, filters, filterTable } = props;

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: string) => filterTable(dataKey, value ? value : null)}
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
            label: 'Size',
            dataKey: 'SIZE',
            cellContentRenderer: (props: TableCellProps) => {
              return formatBytes(props.cellData);
            },
          },
          {
            label: 'Instrument',
            dataKey: 'INSTRUMENT.NAME',
            filterComponent: textFilter,
          },
          {
            label: 'Start Date',
            dataKey: 'STARTDATE',
            cellContentRenderer: (props: TableCellProps) => {
              return props.cellData.toString().split(' ')[0];
            },
          },
          {
            label: 'End Date',
            dataKey: 'ENDDATE',
            cellContentRenderer: (props: TableCellProps) => {
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
});

const mapStateToProps = (state: StateType): InvestigationTableProps => {
  return {
    sort: state.dgtable.sort,
    filters: state.dgtable.filters,
    data: state.dgtable.data,
    loading: state.dgtable.loading,
    error: state.dgtable.error,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InvestigationTable);
