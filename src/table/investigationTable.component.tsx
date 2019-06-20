import React from 'react';
import { InvestigationData, EntityType } from '../data/types';
import memoize, { EqualityFn } from 'memoize-one';
import TextColumnFilter from './columnFilters/textColumnFilter.component';
import NumberColumnFilter from './columnFilters/numberColumnFilter.component';
import { Paper, Typography } from '@material-ui/core';
import { VirtualizedTable } from './table.component';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { formatBytes } from '../data/helpers';

interface InvestigationTableProps {
  rows?: InvestigationData[];
}

interface InvestigationTableState {
  activeFilters: {
    [column: string]: string | { lt: number | null; gt: number | null };
  };
  data: InvestigationData[];
}

class InvestigationTable extends React.Component<
  InvestigationTableProps,
  InvestigationTableState
> {
  public constructor(props: InvestigationTableProps) {
    super(props);
    let data: InvestigationData[] = [];
    if (props.rows) {
      data = props.rows;
    }
    this.state = {
      activeFilters: {},
      data,
    };
    this.onTitleChange = this.onTitleChange.bind(this);
    this.onSizeChange = this.onSizeChange.bind(this);
  }

  public componentDidMount(): void {
    axios
      .get('/investigations', {
        headers: {
          Authorization: window.localStorage.getItem('daaas:token'),
        },
      })
      .then(response => {
        this.setState({ data: response.data });
        this.memoizedFilter = memoize(this.filter, this.deepEqualityFn);
      });
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

  private filter(
    filters: {
      [column: string]: string | { lt: number | null; gt: number | null };
    },
    data: InvestigationData[]
  ): InvestigationData[] {
    if (Object.keys(filters).length === 0) {
      return data;
    }
    let filteredRows: InvestigationData[] = [];
    data.forEach(element => {
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
          detailsPanel={(rowData: EntityType) => {
            const investigationData = rowData as InvestigationData;
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
              cellContentRenderer: props => {
                const investigationData = props.rowData as InvestigationData;
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
              filterComponent: sizeFilter,
              cellContentRenderer: props => {
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
  }
}

export default InvestigationTable;
