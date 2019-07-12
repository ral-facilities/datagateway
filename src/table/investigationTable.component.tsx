import React from 'react';
import TextColumnFilter from './columnFilters/textColumnFilter.component';
import NumberColumnFilter from './columnFilters/numberColumnFilter.component';
import { Paper, Typography } from '@material-ui/core';
import Table from './table.component';
import { Link } from 'react-router-dom';
import { formatBytes } from '../data/helpers';
import {
  Order,
  Filter,
  Investigation,
  StateType,
  Entity,
} from '../state/app.types';
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

  const titleFilter = (
    <TextColumnFilter
      label="Title"
      onChange={(value: string) => filterTable('TITLE', value ? value : null)}
    />
  );

  React.useEffect(() => {
    fetchData();
  }, [fetchData, sort, filters]);

  // const sizeFilter = (
  //   <NumberColumnFilter label="Size" onChange={this.onSizeChange} />
  // );

  return (
    <Paper style={{ height: 400, width: '100%' }}>
      <Table
        data={data}
        sort={sort}
        onSort={sortTable}
        filters={filters}
        onFilter={filterTable}
        detailsPanel={(rowData: Entity) => {
          const investigationData = rowData as Investigation;
          return (
            <div>
              <Typography>
                <b>Proposal: </b>
                {investigationData.RB_NUMBER}
              </Typography>
              <Typography>
                <b>Title: </b>
                {investigationData.TITLE}
              </Typography>
              <Typography>
                <b>Start Date: </b>
                {investigationData.STARTDATE}
              </Typography>
              <Typography>
                <b>End Date: </b>
                {investigationData.ENDDATE}
              </Typography>
            </div>
          );
        }}
        columns={[
          {
            label: 'Title',
            dataKey: 'TITLE',
            cellContentRenderer: function investigationLink(
              props: TableCellProps
            ) {
              const investigationData = props.rowData as Investigation;
              return (
                <Link
                  to={`/browse/investigation/${investigationData.ID}/dataset`}
                >
                  {investigationData.TITLE}
                </Link>
              );
            },
            filterComponent: titleFilter,
          },
          {
            label: 'Visit ID',
            dataKey: 'VISIT_ID',
          },
          {
            label: 'RB Number',
            dataKey: 'RB_NUMBER',
          },
          {
            label: 'DOI',
            dataKey: 'DOI',
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
          },
          {
            label: 'Start Date',
            dataKey: 'STARTDATE',
          },
          {
            label: 'End Date',
            dataKey: 'ENDDATE',
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
