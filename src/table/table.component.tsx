import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import {
  withStyles,
  createStyles,
  Theme,
  StyleRules,
  WithStyles,
} from '@material-ui/core/styles';
import {
  AutoSizer,
  Column,
  Table,
  TableCellProps,
  TableHeaderProps,
  TableCellRenderer,
  RowMouseEventHandlerParams,
  SortDirection,
  SortDirectionType,
} from 'react-virtualized';
import classNames from 'classnames';
import { Paper, TextField } from '@material-ui/core';
import memoize, { EqualityFn } from 'memoize-one';
import { FoodData } from '../data/types';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    table: {
      fontFamily: theme.typography.fontFamily,
    },
    flexContainer: {
      display: 'flex',
      alignItems: 'center',
      boxSizing: 'border-box',
    },
    tableRow: {
      cursor: 'pointer',
    },
    tableRowHover: {
      '&:hover': {
        backgroundColor: theme.palette.grey[200],
      },
    },
    tableCell: {
      flex: 1,
    },
    noClick: {
      cursor: 'initial',
    },
  });

class TextColumnFilter extends React.Component<
  { label: string; onChange: (value: string) => void },
  { value: string }
> {
  public constructor(props: {
    label: string;
    onChange: (value: string) => void;
  }) {
    super(props);
    this.state = {
      value: '',
    };
    this.handleChange = this.handleChange.bind(this);
  }

  private handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    this.props.onChange(event.target.value);
    this.setState({
      value: event.target.value,
    });
  }

  public render(): React.ReactElement {
    return (
      <TextField
        label={this.props.label}
        value={this.state.value}
        onChange={this.handleChange}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
      />
    );
  }
}

class NumberColumnFilter extends React.Component<
  {
    label: string;
    onChange: (value: { lt: number | null; gt: number | null }) => void;
  },
  { lessThan: number | null; greaterThan: number | null }
> {
  public constructor(props: {
    label: string;
    onChange: (value: { lt: number | null; gt: number | null }) => void;
  }) {
    super(props);
    this.state = {
      lessThan: null,
      greaterThan: null,
    };
    this.handleGreaterThanChange = this.handleGreaterThanChange.bind(this);
    this.handleLessThanChange = this.handleLessThanChange.bind(this);
  }

  private handleGreaterThanChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    const greaterThan = parseInt(event.target.value) || null;
    this.props.onChange({ gt: greaterThan, lt: this.state.lessThan });
    this.setState({
      greaterThan,
    });
  }

  private handleLessThanChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    const lessThan = parseInt(event.target.value) || null;
    this.props.onChange({ lt: lessThan, gt: this.state.greaterThan });
    this.setState({
      lessThan,
    });
  }

  public render(): React.ReactElement {
    return (
      <form>
        <TextField
          label="From"
          value={this.state.greaterThan || ''}
          onChange={this.handleGreaterThanChange}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
        />
        <TextField
          label="To"
          value={this.state.lessThan || ''}
          onChange={this.handleLessThanChange}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
        />
      </form>
    );
  }
}

interface MuiVirtualizedTableProps {
  data: FoodData[];
  headerHeight: number;
  rowHeight: number;
  columns: ColumnType[];
  rowCount: number;
  rowClassName?: string;
  onRowClick?: (params: RowMouseEventHandlerParams) => void;
  filterBy?: string;
  filterValue?: string;
}

interface MuiVirtualizedTableState {
  sortBy: string;
  sortDirection: SortDirectionType;
}

class MuiVirtualizedTable extends React.PureComponent<
  MuiVirtualizedTableProps & WithStyles<typeof styles>,
  MuiVirtualizedTableState
> {
  public constructor(
    props: MuiVirtualizedTableProps & WithStyles<typeof styles>
  ) {
    super(props);

    const sortBy = 'calories';
    const sortDirection = SortDirection.ASC;

    this.state = {
      sortDirection: sortDirection,
      sortBy: sortBy,
    };

    this.sort = this.sort.bind(this);
  }

  private memoizedSort = memoize(this.sortList);

  // private static getDerivedStateFromProps(
  //   newProps: MuiVirtualizedTableProps & WithStyles<typeof styles>,
  //   prevState: MuiVirtualizedTableState
  // ) {

  // }

  private sort({
    sortBy,
    sortDirection,
  }: {
    sortBy: string;
    sortDirection: SortDirectionType;
  }): void {
    this.setState({ sortBy, sortDirection });
  }

  private sortList({
    sortBy,
    sortDirection,
  }: {
    sortBy: string;
    sortDirection: SortDirectionType;
  }): FoodData[] {
    const { data } = this.props;
    if (sortBy) {
      let updatedList = data.sort(function(a, b) {
        var itemA = a[sortBy];
        var itemB = b[sortBy];
        if (itemA < itemB) {
          return -1;
        }
        if (itemA > itemB) {
          return 1;
        }
        return 0;
      });
      if (sortDirection === SortDirection.DESC) {
        updatedList.reverse();
      }
      return updatedList;
    } else {
      return data;
    }
  }

  private getRowClassName = ({ index }: { index: number }) => {
    const { classes, rowClassName, onRowClick } = this.props;

    return classNames(classes.tableRow, classes.flexContainer, rowClassName, {
      [classes.tableRowHover]: index !== -1 && onRowClick != null,
    });
  };

  private cellRenderer = (props: TableCellProps): React.ReactNode => {
    const { columns, classes, rowHeight } = this.props;
    return (
      <TableCell
        component="div"
        className={classNames(classes.tableCell, classes.flexContainer)}
        variant="body"
        style={{ height: rowHeight }}
      >
        {props.cellData}
      </TableCell>
    );
  };

  private headerRenderer = (
    props: TableHeaderProps & { columnIndex: number }
  ): React.ReactNode => {
    const { headerHeight, classes, columns } = this.props;

    let direction: 'asc' | 'desc' | undefined;
    if (props.sortDirection === SortDirection.ASC) {
      direction = 'asc';
    }
    if (props.sortDirection === SortDirection.DESC) {
      direction = 'desc';
    }

    const inner = !props.disableSort ? (
      <TableSortLabel
        active={props.dataKey === props.sortBy}
        direction={direction}
      >
        {props.label}
      </TableSortLabel>
    ) : (
      props.label
    );

    return (
      <TableCell
        component="div"
        className={classNames(
          classes.tableCell,
          classes.flexContainer,
          classes.noClick
        )}
        variant="head"
        style={{ height: headerHeight }}
        sortDirection={props.dataKey === props.sortBy ? direction : false}
      >
        {inner}
        {columns[props.columnIndex].filterComponent}
      </TableCell>
    );
  };

  public render(): React.ReactElement {
    const { classes, columns, ...tableProps } = this.props;

    const sortedList = this.memoizedSort({
      sortBy: this.state.sortBy,
      sortDirection: this.state.sortDirection,
    });

    return (
      <AutoSizer>
        {({ height, width }) => (
          <Table
            className={classes.table}
            height={height}
            width={width}
            {...tableProps}
            data={this.props.data}
            rowClassName={this.getRowClassName}
            rowGetter={({ index }) => sortedList[index]}
            sort={this.sort}
            sortBy={this.state.sortBy}
            sortDirection={this.state.sortDirection}
          >
            {columns.map(
              (
                {
                  cellContentRenderer = null,
                  className,
                  dataKey,
                  disableSort,
                  ...other
                },
                index
              ) => {
                let renderer;
                if (cellContentRenderer != null) {
                  renderer = (cellRendererProps: TableCellProps) =>
                    this.cellRenderer({
                      cellData: cellContentRenderer(cellRendererProps),
                      columnIndex: index,
                      dataKey: dataKey,
                      isScrolling: false,
                      rowData: {},
                      rowIndex: index,
                    });
                } else {
                  renderer = this.cellRenderer;
                }

                return (
                  <Column
                    width={50}
                    flexGrow={3}
                    flexShrink={1}
                    key={dataKey}
                    headerRenderer={headerProps =>
                      this.headerRenderer({
                        ...headerProps,
                        columnIndex: index,
                      })
                    }
                    disableSort={disableSort}
                    className={classNames(classes.flexContainer, className)}
                    cellRenderer={renderer}
                    dataKey={dataKey}
                    {...other}
                  />
                );
              }
            )}
          </Table>
        )}
      </AutoSizer>
    );
  }
}

const WrappedVirtualizedTable = withStyles(styles)(MuiVirtualizedTable);

interface ColumnType {
  label: string;
  dataKey: string;
  flexGrow?: number;
  numeric?: boolean;
  cellContentRenderer?: TableCellRenderer;
  className?: string;
  disableSort?: boolean;
  filterComponent?: React.ReactElement;
}

class ReactVirtualizedTable extends React.Component<
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
        <WrappedVirtualizedTable
          data={filteredRows}
          headerHeight={56}
          rowHeight={56}
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
              numeric: true,
              filterComponent: calorieFilter,
            },
            {
              label: 'Fat (g)',
              dataKey: 'fat',
              numeric: true,
              disableSort: true,
            },
            {
              label: 'Carbs (g)',
              dataKey: 'carbs',
              numeric: true,
              disableSort: true,
            },
            {
              label: 'Protein (g)',
              dataKey: 'protein',
              numeric: true,
              disableSort: true,
            },
          ]}
        />
      </Paper>
    );
  }
}

export default ReactVirtualizedTable;
