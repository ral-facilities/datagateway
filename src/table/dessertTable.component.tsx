import React from 'react';
import { FoodData } from '../data/types';
import memoize, { EqualityFn } from 'memoize-one';
import TextColumnFilter from './columnFilters/textColumnFilter.component';
import NumberColumnFilter from './columnFilters/numberColumnFilter.component';
import { Paper } from '@material-ui/core';
import { VirtualizedTable } from './table.component';

class DessertTable extends React.Component<
  { rows: FoodData[] },
  {
    activeFilters: {
      [column: string]: string | { lt: number | null; gt: number | null };
    };
  }
> {
  public constructor(props: { rows: FoodData[] }) {
    super(props);
    this.state = {
      activeFilters: {},
    };
    this.onDessertChange = this.onDessertChange.bind(this);
    this.onCalorieChange = this.onCalorieChange.bind(this);
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

  public onDessertChange(value: string): void {
    this.setState({
      activeFilters: {
        ...this.state.activeFilters,
        dessert: value,
      },
    });
  }

  public onCalorieChange(value: {
    lt: number | null;
    gt: number | null;
  }): void {
    this.setState({
      activeFilters: {
        ...this.state.activeFilters,
        calories: value,
      },
    });
  }

  private filter(filters: {
    [column: string]: string | { lt: number | null; gt: number | null };
  }): FoodData[] {
    if (Object.keys(filters).length === 0) {
      return this.props.rows;
    }
    let filteredRows: FoodData[] = [];
    this.props.rows.forEach(element => {
      let satisfyFilters = true;
      for (let column in filters) {
        if (column === 'dessert') {
          if (
            element[column]
              .toLowerCase()
              .indexOf((filters[column] as string).toLowerCase()) === -1
          ) {
            satisfyFilters = false;
          }
        }
        if (column === 'calories') {
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
    const dessertFilter = (
      <TextColumnFilter label="Dessert" onChange={this.onDessertChange} />
    );
    const calorieFilter = (
      <NumberColumnFilter label="Calories" onChange={this.onCalorieChange} />
    );
    const filteredRows = this.memoizedFilter(this.state.activeFilters);

    return (
      <Paper style={{ height: 400, width: '100%' }}>
        <VirtualizedTable
          data={filteredRows}
          headerHeight={100}
          rowHeight={56}
          detailsPanel={rowData => <div />}
          rowCount={filteredRows.length}
          onRowClick={event => console.log(event)}
          columns={[
            {
              label: 'Dessert',
              dataKey: 'dessert',
              filterComponent: dessertFilter,
            },
            {
              label: 'Calories (g)',
              dataKey: 'calories',
              filterComponent: calorieFilter,
            },
            {
              label: 'Fat (g)',
              dataKey: 'fat',
              disableSort: true,
            },
            {
              label: 'Carbs (g)',
              dataKey: 'carbs',
              disableSort: true,
            },
            {
              label: 'Protein (g)',
              dataKey: 'protein',
              disableSort: true,
            },
          ]}
        />
      </Paper>
    );
  }
}

export default DessertTable;
