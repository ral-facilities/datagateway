import React from 'react';
import { DatasetData, EntityType } from '../data/types';
import memoize, { EqualityFn } from 'memoize-one';
import TextColumnFilter from './columnFilters/textColumnFilter.component';
import NumberColumnFilter from './columnFilters/numberColumnFilter.component';
import { Paper, Typography } from '@material-ui/core';
import { VirtualizedTable } from './table.component';

interface DatasetTableProps {
  rows: DatasetData[];
}

interface DatasetTableState {
  activeFilters: {
    [column: string]: string | { lt: number | null; gt: number | null };
  };
}

class DatasetTable extends React.Component<
  DatasetTableProps,
  DatasetTableState
> {
  public constructor(props: DatasetTableProps) {
    super(props);
    this.state = {
      activeFilters: {},
    };
    this.onNameChange = this.onNameChange.bind(this);
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

  public onNameChange(value: string): void {
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
  }): DatasetData[] {
    if (Object.keys(filters).length === 0) {
      return this.props.rows;
    }
    let filteredRows: DatasetData[] = [];
    this.props.rows.forEach(element => {
      let satisfyFilters = true;
      for (let column in filters) {
        if (column === 'NAME') {
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
    const nameFilter = (
      <TextColumnFilter label="Name" onChange={this.onNameChange} />
    );
    const sizeFilter = (
      <NumberColumnFilter label="Size" onChange={this.onSizeChange} />
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
          detailsPanel={(rowData: EntityType) => {
            const datasetData = rowData as DatasetData;
            return (
              <div>
                <Typography>
                  <b>Name: </b> {datasetData.NAME}
                </Typography>
                <Typography>
                  <b>Description: </b> {datasetData.NAME}
                </Typography>
              </div>
            );
          }}
          columns={[
            {
              label: 'Name',
              dataKey: 'NAME',
              type: 'string',
              filterComponent: nameFilter,
            },
            {
              label: 'Size',
              dataKey: 'SIZE',
              type: 'filesize',
              filterComponent: sizeFilter,
            },
            {
              label: 'Create Time',
              dataKey: 'CREATE_TIME',
              type: 'date',
            },
            {
              label: 'Modified Time',
              dataKey: 'MOD_TIME',
              type: 'date',
            },
          ]}
        />
      </Paper>
    );
  }
}

export default DatasetTable;
