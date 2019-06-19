import React from 'react';
import { EntityType, DatafileData } from '../data/types';
import memoize, { EqualityFn } from 'memoize-one';
import TextColumnFilter from './columnFilters/textColumnFilter.component';
import NumberColumnFilter from './columnFilters/numberColumnFilter.component';
import { Paper, Typography } from '@material-ui/core';
import { VirtualizedTable } from './table.component';
import { formatBytes } from '../data/helpers';
import axios from 'axios';

interface DatafileTableProps {
  rows?: DatafileData[];
  datasetId?: string;
}

interface DatafileTableState {
  activeFilters: {
    [column: string]: string | { lt: number | null; gt: number | null };
  };
  data: DatafileData[];
}

class DatafileTable extends React.Component<
  DatafileTableProps,
  DatafileTableState
> {
  public constructor(props: DatafileTableProps) {
    super(props);
    let data: DatafileData[] = [];
    if (props.rows) {
      data = props.rows;
    }
    this.state = {
      activeFilters: {},
      data,
    };
    this.onNameChange = this.onNameChange.bind(this);
    this.onSizeChange = this.onSizeChange.bind(this);
  }

  public componentDidMount(): void {
    if (this.props.datasetId) {
      axios
        .get(
          `/datafiles?filter={"where": {"DATASET_ID": "${this.props.datasetId}"}}`,
          {
            headers: {
              Authorization: window.localStorage.getItem('daaas:token'),
            },
          }
        )
        .then(response => {
          this.setState({ data: response.data });
          memoize(this.filter, this.deepEqualityFn);
        });
    }
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

  private filter(
    filters: {
      [column: string]: string | { lt: number | null; gt: number | null };
    },
    data: DatafileData[]
  ): DatafileData[] {
    if (Object.keys(filters).length === 0) {
      return data;
    }
    let filteredRows: DatafileData[] = [];
    data.forEach(element => {
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
    const filteredRows = this.memoizedFilter(
      this.state.activeFilters,
      this.state.data
    );

    return (
      <Paper style={{ height: 400, width: '100%' }}>
        <VirtualizedTable
          data={filteredRows}
          headerHeight={100}
          rowHeight={56}
          rowCount={filteredRows.length}
          onRowClick={event => console.log(event)}
          detailsPanel={(rowData: EntityType) => {
            const datafileData = rowData as DatafileData;
            return (
              <div>
                <Typography>
                  <b>Name: </b> {datafileData.NAME}
                </Typography>
                <Typography>
                  <b>File Size: </b> {formatBytes(datafileData.SIZE)}
                </Typography>
                <Typography>
                  <b>Location: </b> {datafileData.LOCATION}
                </Typography>
              </div>
            );
          }}
          columns={[
            {
              label: 'Name',
              dataKey: 'NAME',
              filterComponent: nameFilter,
            },
            {
              label: 'Location',
              dataKey: 'LOCATION',
            },
            {
              label: 'Size',
              dataKey: 'SIZE',
              filterComponent: sizeFilter,
              cellContentRenderer: props => {
                return formatBytes(props.cellData);
              },
            },
            {
              label: 'Modified Time',
              dataKey: 'MOD_TIME',
            },
          ]}
        />
      </Paper>
    );
  }
}

export default DatafileTable;
