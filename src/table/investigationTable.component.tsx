import React from 'react';
import { InvestigationData, EntityType } from '../data/types';
import memoize, { EqualityFn } from 'memoize-one';
import TextColumnFilter from './columnFilters/textColumnFilter.component';
import NumberColumnFilter from './columnFilters/numberColumnFilter.component';
import { Paper, Typography } from '@material-ui/core';
import { VirtualizedTable } from './table.component';

interface InvestigationTableProps {
  rows: InvestigationData[];
}

interface InvestigationTableState {
  activeFilters: {
    [column: string]: string | { lt: number | null; gt: number | null };
  };
}

class InvestigationTable extends React.Component<
  InvestigationTableProps,
  InvestigationTableState
> {
  public constructor(props: InvestigationTableProps) {
    super(props);
    this.state = {
      activeFilters: {},
    };
    this.onTitleChange = this.onTitleChange.bind(this);
    this.onSizeChange = this.onSizeChange.bind(this);
  }

  private deepEqualityFn: EqualityFn = (
    newFilter: {
      [column: string]: string | { lt: number | null; gt: number | null };
    },
    oldFilter: {
      [column: string]: string | { lt: number | null; gt: number | null };
    }
  ): boolean => {
    if (Object.keys(newFilter).length !== Object.keys(oldFilter).length) {
      return false;
    }
    for (let column in newFilter) {
      if (newFilter[column] !== oldFilter[column]) {
        return false;
      }
    }
    return true;
  };

  private memoizedFilter = memoize(this.filter, this.deepEqualityFn);

  public onTitleChange(value: string): void {
    this.setState({
      activeFilters: {
        ...this.state.activeFilters,
        TITLE: value,
      },
    });
  }

  public onSizeChange(value: { lt: number | null; gt: number | null }): void {
    this.setState({
      activeFilters: {
        ...this.state.activeFilters,
        SIZE: value,
      },
    });
  }

  private filter(filters: {
    [column: string]: string | { lt: number | null; gt: number | null };
  }): InvestigationData[] {
    if (Object.keys(filters).length === 0) {
      return this.props.rows;
    }
    let filteredRows: InvestigationData[] = [];
    this.props.rows.forEach(element => {
      let satisfyFilters = true;
      for (let column in filters) {
        if (column === 'TITLE') {
          if (
            element[column]
              .toLowerCase()
              .indexOf((filters[column] as string).toLowerCase()) === -1
          ) {
            satisfyFilters = false;
          }
        }
        if (column === 'SIZE') {
          let between = true;
          const betweenFilter = filters[column] as {
            lt: number | null;
            gt: number | null;
          };
          if (betweenFilter.lt !== null) {
            if (element[column] > betweenFilter.lt) {
              between = false;
            }
          }
          if (betweenFilter.gt !== null) {
            if (element[column] < betweenFilter.gt) {
              between = false;
            }
          }
          if (!between) {
            satisfyFilters = false;
          }
        }
      }
      if (satisfyFilters) {
        filteredRows.push(element);
      }
    });
    return filteredRows;
  }

  public render(): React.ReactElement {
    const titleFilter = (
      <TextColumnFilter label="Title" onChange={this.onTitleChange} />
    );
    const sizeFilter = (
      <NumberColumnFilter label="Calories" onChange={this.onSizeChange} />
    );
    const filteredRows = this.memoizedFilter(this.state.activeFilters);

    return (
      <Paper style={{ height: 400, width: '100%' }}>
        <VirtualizedTable
          data={filteredRows}
          headerHeight={100}
          rowHeight={56}
          rowCount={filteredRows.length}
          onRowClick={event => console.log(event)}
          detailsPanel={(rowData: EntityType) => (
            <div>
              <Typography>
                <b>Proposal:</b> {rowData.TITLE}
              </Typography>
              <Typography>
                <b>Title:</b> {rowData.TITLE}
              </Typography>
              <Typography>
                <b>Start Date:</b> {(rowData.STARTDATE as Date).toDateString()}
              </Typography>
              <Typography>
                <b>End Date:</b> {(rowData.ENDDATE as Date).toDateString()}
              </Typography>
            </div>
          )}
          columns={[
            {
              label: 'Title',
              dataKey: 'TITLE',
              type: 'string',
              filterComponent: titleFilter,
            },
            {
              label: 'Visit ID',
              dataKey: 'VISIT_ID',
              type: 'number',
            },
            {
              label: 'RB Number',
              dataKey: 'RB_NUMBER',
              type: 'string',
            },
            {
              label: 'DOI',
              dataKey: 'DOI',
              type: 'string',
            },
            {
              label: 'Size',
              dataKey: 'SIZE',
              type: 'number',
              filterComponent: sizeFilter,
            },
            {
              label: 'Instrument',
              dataKey: 'INSTRUMENT.NAME',
              type: 'string',
            },
            {
              label: 'Start Date',
              dataKey: 'STARTDATE',
              type: 'date',
            },
            {
              label: 'End Date',
              dataKey: 'ENDDATE',
              type: 'date',
            },
          ]}
        />
      </Paper>
    );
  }
}

export default InvestigationTable;
