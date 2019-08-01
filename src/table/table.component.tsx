import React from 'react';
import TableCell from '@material-ui/core/TableCell';
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
  TableCellRenderer,
  ColumnSizer,
  defaultTableRowRenderer,
} from 'react-virtualized';
import clsx from 'clsx';
import { Entity, Order } from '../state/app.types';
import ExpandCell from './cellRenderers/expandCell.component';
import DataCell from './cellRenderers/dataCell.component';
import ActionCell from './cellRenderers/actionCell.component';
import DataHeader from './headerRenderers/dataHeader.component';
import DetailsPanelRow from './rowRenderers/detailsPanelRow.component';

const rowHeight = 30;
const headerHeight = 100;

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
    headerFlexContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'left',
      boxSizing: 'border-box',
    },
    tableRow: {},
    tableRowHover: {
      '&:hover': {
        backgroundColor: theme.palette.grey[200],
      },
    },
    tableCell: {
      flex: 1,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      height: rowHeight,
    },
    headerTableCell: {
      height: headerHeight,
    },
  });

export interface ColumnType {
  label: string;
  dataKey: string;
  cellContentRenderer?: TableCellRenderer;
  className?: string;
  disableSort?: boolean;
  filterComponent?: (label: string, dataKey: string) => React.ReactElement;
}

interface VirtualizedTableProps {
  data: Entity[];
  columns: ColumnType[];
  sort: { [column: string]: Order };
  onSort: (column: string, order: Order | null) => void;
  detailsPanel?: (rowData: Entity) => React.ReactElement;
  actions?: ((rowData: Entity) => React.ReactElement)[];
}

const VirtualizedTable = (
  props: VirtualizedTableProps & WithStyles<typeof styles>
): React.ReactElement => {
  const [expandedIndex, setExpandedIndex] = React.useState(-1);
  const [detailPanelHeight, setDetailPanelHeight] = React.useState(rowHeight);

  const tableRef = React.useRef<Table>(null);
  const detailPanelRef = React.useRef<HTMLDivElement>(null);

  const { actions, classes, columns, data, detailsPanel, sort, onSort } = props;

  React.useEffect(() => {
    if (tableRef && tableRef.current) {
      tableRef.current.recomputeRowHeights();
    }
    if (detailPanelRef && detailPanelRef.current) {
      setDetailPanelHeight(detailPanelRef.current.clientHeight);
    }
  }, [expandedIndex]);

  return (
    <AutoSizer>
      {({ height, width }) => {
        return (
          <ColumnSizer
            width={width || 800}
            columnCount={columns.length}
            columnMinWidth={100}
          >
            {({ columnWidth }) => (
              <Table
                ref={tableRef}
                className={classes.table}
                height={height || 500}
                width={width || 800}
                rowCount={data.length}
                headerHeight={headerHeight}
                rowHeight={({ index }) =>
                  index === expandedIndex
                    ? rowHeight + detailPanelHeight
                    : rowHeight
                }
                rowClassName={({ index }): string =>
                  clsx(
                    classes.tableRow,
                    classes.flexContainer,
                    index > -1 && classes.tableRowHover
                  )
                }
                rowGetter={({ index }) => data[index]}
                rowRenderer={props => {
                  if (detailsPanel && props.index === expandedIndex) {
                    return (
                      <DetailsPanelRow
                        {...props}
                        detailsPanel={detailsPanel}
                        detailPanelRef={detailPanelRef}
                      />
                    );
                  } else {
                    return defaultTableRowRenderer(props);
                  }
                }}
              >
                {detailsPanel && (
                  <Column
                    width={70}
                    key="Expand"
                    dataKey="expand"
                    headerRenderer={() => (
                      <TableCell
                        component="div"
                        className={clsx(
                          classes.headerTableCell,
                          classes.headerFlexContainer
                        )}
                        variant="head"
                      />
                    )}
                    className={classes.flexContainer}
                    cellRenderer={props => (
                      <ExpandCell
                        {...props}
                        expandedIndex={expandedIndex}
                        setExpandedIndex={setExpandedIndex}
                        className={clsx(
                          classes.tableCell,
                          classes.flexContainer
                        )}
                      />
                    )}
                  />
                )}
                {columns.map(
                  ({
                    cellContentRenderer,
                    className,
                    dataKey,
                    label,
                    filterComponent,
                  }) => {
                    return (
                      <Column
                        width={columnWidth}
                        flexGrow={3}
                        flexShrink={1}
                        key={dataKey}
                        dataKey={dataKey}
                        label={label}
                        headerRenderer={headerProps => (
                          <DataHeader
                            {...headerProps}
                            className={clsx(
                              classes.headerTableCell,
                              classes.headerFlexContainer
                            )}
                            sort={sort}
                            onSort={onSort}
                            filterComponent={
                              filterComponent && filterComponent(label, dataKey)
                            }
                          />
                        )}
                        className={clsx(classes.flexContainer, className)}
                        cellRenderer={props => (
                          <DataCell
                            {...props}
                            cellContentRenderer={cellContentRenderer}
                            className={clsx(
                              classes.tableCell,
                              classes.flexContainer
                            )}
                          />
                        )}
                      />
                    );
                  }
                )}
                {actions && (
                  <Column
                    width={70}
                    key="Actions"
                    dataKey="actions"
                    className={classes.flexContainer}
                    headerRenderer={headerProps => (
                      <TableCell
                        component="div"
                        className={clsx(
                          classes.headerTableCell,
                          classes.headerFlexContainer
                        )}
                        variant="head"
                      >
                        Actions
                      </TableCell>
                    )}
                    cellRenderer={props => (
                      <ActionCell
                        {...props}
                        actions={actions}
                        className={clsx(
                          classes.tableCell,
                          classes.flexContainer
                        )}
                      />
                    )}
                  />
                )}
              </Table>
            )}
          </ColumnSizer>
        );
      }}
    </AutoSizer>
  );
};

export default withStyles(styles)(VirtualizedTable);
