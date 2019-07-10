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
  TableHeaderProps,
  TableCellRenderer,
  RowMouseEventHandlerParams,
  SortDirection,
  SortDirectionType,
  ColumnSizer,
  defaultTableRowRenderer,
  TableRowProps,
  TableCellProps,
} from 'react-virtualized';
import clsx from 'clsx';
import memoize from 'memoize-one';
import { EntityType } from '../data/types';
import { IconButton } from '@material-ui/core';
import { ExpandMore, ExpandLess } from '@material-ui/icons';

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

interface ColumnType {
  label: string;
  dataKey: string;
  cellContentRenderer?: TableCellRenderer;
  className?: string;
  disableSort?: boolean;
  filterComponent?: React.ReactElement;
}

interface MuiVirtualizedTableProps {
  data: EntityType[];
  headerHeight: number;
  rowHeight: number;
  columns: ColumnType[];
  rowCount: number;
  detailsPanel?: (rowData: EntityType) => React.ReactElement;
  rowClassName?: string;
  onRowClick?: (params: RowMouseEventHandlerParams) => void;
  filterBy?: string;
  filterValue?: string;
  actions?: ((rowData: EntityType) => React.ReactElement)[];
}

interface MuiVirtualizedTableState {
  sortBy: string;
  sortDirection: SortDirectionType;
  selectedIndex: number;
  detailPanelHeight: number;
}

class MuiVirtualizedTable extends React.PureComponent<
  MuiVirtualizedTableProps & WithStyles<typeof styles>,
  MuiVirtualizedTableState
> {
  private tableRef: React.RefObject<Table>;
  private detailPanelRef: React.RefObject<HTMLDivElement>;

  public constructor(
    props: MuiVirtualizedTableProps & WithStyles<typeof styles>
  ) {
    super(props);

    this.state = {
      sortDirection: SortDirection.ASC,
      sortBy: '',
      selectedIndex: -1,
      detailPanelHeight: props.rowHeight,
    };

    this.sort = this.sort.bind(this);
    this.tableRef = React.createRef();
    this.detailPanelRef = React.createRef();
  }

  public componentDidUpdate(): void {
    if (this.tableRef && this.tableRef.current) {
      this.tableRef.current.recomputeRowHeights();
    }
    if (this.detailPanelRef && this.detailPanelRef.current) {
      this.setState({
        detailPanelHeight: this.detailPanelRef.current.clientHeight,
      });
    }
  }

  private memoizedSort = memoize(this.sortList);

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
  }): EntityType[] {
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

    return clsx(classes.tableRow, classes.flexContainer, rowClassName, {
      [classes.tableRowHover]: index !== -1 && onRowClick != null,
    });
  };

  private rowRenderer = (
    props: TableRowProps & {
      detailsPanel: (rowData: EntityType) => React.ReactElement;
    }
  ): React.ReactNode => {
    const { index, style, className, rowData } = props;
    if (index === this.state.selectedIndex) {
      return (
        <div
          style={{ ...style, display: 'flex', flexDirection: 'column' }}
          className={className}
          key={index}
        >
          {defaultTableRowRenderer({
            ...props,
            style: { width: style.width, height: this.props.rowHeight },
          })}
          <div ref={this.detailPanelRef} style={{ marginRight: 'auto' }}>
            {props.detailsPanel(rowData)}
          </div>
        </div>
      );
    }
    return defaultTableRowRenderer(props);
  };

  private cellRenderer: TableCellRenderer = props => {
    const { classes, rowHeight } = this.props;

    let cellValue;
    if (props.dataKey.indexOf('.') !== -1) {
      cellValue = props.dataKey.split('.').reduce(function(prev, curr) {
        return prev ? prev[curr] : null;
      }, props.rowData);
    } else {
      cellValue = props.cellData;
    }

    return (
      <TableCell
        component="div"
        className={clsx(classes.tableCell, classes.flexContainer)}
        variant="body"
        size="small"
        style={{ height: rowHeight }}
      >
        {cellValue}
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
        className={clsx(
          classes.tableCell,
          classes.flexContainer,
          classes.noClick
        )}
        variant="head"
        size="small"
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
          <ColumnSizer
            width={width}
            columnCount={columns.length}
            columnMinWidth={100}
          >
            {({ columnWidth }) => (
              <Table
                ref={this.tableRef}
                className={classes.table}
                height={height}
                width={width}
                {...tableProps}
                data={this.props.data}
                rowClassName={this.getRowClassName}
                rowGetter={({ index }) => sortedList[index]}
                rowRenderer={props => {
                  if (this.props.detailsPanel) {
                    return this.rowRenderer({
                      ...props,
                      detailsPanel: this.props.detailsPanel,
                    });
                  } else {
                    return defaultTableRowRenderer(props);
                  }
                }}
                rowHeight={({ index }) =>
                  index === this.state.selectedIndex
                    ? this.props.rowHeight + this.state.detailPanelHeight
                    : this.props.rowHeight
                }
                sort={this.sort}
                sortBy={this.state.sortBy}
                sortDirection={this.state.sortDirection}
              >
                {this.props.detailsPanel && (
                  <Column
                    width={70}
                    style={{ marginLeft: '-10px' }}
                    key="Expand"
                    disableSort={true}
                    headerRenderer={headerProps => (
                      <TableCell
                        component="div"
                        className={clsx(
                          classes.tableCell,
                          classes.flexContainer,
                          classes.noClick
                        )}
                        variant="head"
                        size="small"
                        style={{ height: this.props.headerHeight }}
                      ></TableCell>
                    )}
                    cellRenderer={props => (
                      <TableCell
                        component="div"
                        className={clsx(
                          classes.tableCell,
                          classes.flexContainer
                        )}
                        variant="body"
                        style={{ height: this.props.rowHeight }}
                      >
                        {props.rowIndex !== this.state.selectedIndex ? (
                          <IconButton
                            onClick={() =>
                              this.setState({ selectedIndex: props.rowIndex })
                            }
                          >
                            <ExpandMore />
                          </IconButton>
                        ) : (
                          <IconButton
                            onClick={() => this.setState({ selectedIndex: -1 })}
                          >
                            <ExpandLess />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                    dataKey={'expand'}
                  />
                )}
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
                          ...cellRendererProps,
                          cellData: cellContentRenderer(cellRendererProps),
                        });
                    } else {
                      renderer = this.cellRenderer;
                    }

                    return (
                      <Column
                        width={columnWidth}
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
                        className={clsx(classes.flexContainer, className)}
                        cellRenderer={renderer}
                        dataKey={dataKey}
                        {...other}
                      />
                    );
                  }
                )}
                {this.props.actions && (
                  <Column
                    width={70}
                    key="Actions"
                    disableSort={true}
                    headerRenderer={headerProps => (
                      <TableCell
                        component="div"
                        className={clsx(
                          classes.tableCell,
                          classes.flexContainer,
                          classes.noClick
                        )}
                        variant="head"
                        size="small"
                        style={{ height: this.props.headerHeight }}
                      ></TableCell>
                    )}
                    cellRenderer={props => (
                      <TableCell
                        component="div"
                        className={clsx(
                          classes.tableCell,
                          classes.flexContainer
                        )}
                        variant="body"
                        size="small"
                        style={{ height: this.props.rowHeight }}
                      >
                        {this.props.actions !== undefined &&
                          this.props.actions.map(element =>
                            element(props.rowData)
                          )}
                      </TableCell>
                    )}
                    dataKey={'expand'}
                  />
                )}
              </Table>
            )}
          </ColumnSizer>
        )}
      </AutoSizer>
    );
  }
}

export const VirtualizedTable = withStyles(styles)(MuiVirtualizedTable);
