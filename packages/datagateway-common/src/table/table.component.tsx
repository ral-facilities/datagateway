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
  defaultTableRowRenderer,
  InfiniteLoader,
  IndexRange,
  Index,
  TableRowRenderer,
} from 'react-virtualized';
import clsx from 'clsx';
import { Entity, Order, ICATEntity } from '../app.types';
import ExpandCell from './cellRenderers/expandCell.component';
import DataCell from './cellRenderers/dataCell.component';
import ActionCell from './cellRenderers/actionCell.component';
import DataHeader from './headerRenderers/dataHeader.component';
import DetailsPanelRow from './rowRenderers/detailsPanelRow.component';
import SelectCell from './cellRenderers/selectCell.component';
import SelectHeader from './headerRenderers/selectHeader.component';

const rowHeight = 30;
const headerHeight = 110;
const selectColumnWidth = 40;
const detailsColumnWidth = 40;
const actionsColumnDefaultWidth = 70;
const scrollBarHeight = 17;
const dataColumnMinWidth = 84;

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
      flexDirection: 'row',
      boxSizing: 'border-box',
      overflow: 'hidden',
    },
    tableRow: {},
    tableRowHover: {
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
    tableCell: {
      flex: 1,
      overflow: 'hidden',
      height: rowHeight,
    },
    headerTableCell: {
      flex: 1,
      height: headerHeight,
      justifyContent: 'space-between',
    },
  });

export interface ColumnType {
  label: string;
  dataKey: string;
  icon?: JSX.Element;
  cellContentRenderer?: TableCellRenderer;
  className?: string;
  disableSort?: boolean;
  filterComponent?: (label: string, dataKey: string) => React.ReactElement;
}

export interface DetailsPanelProps {
  rowData: Entity;
  detailsPanelResize: () => void;
}

export interface TableActionProps {
  rowData: Entity;
}

interface VirtualizedTableProps {
  loading: boolean;
  data: Entity[];
  columns: ColumnType[];
  loadMoreRows?: (offsetParams: IndexRange) => Promise<unknown>;
  totalRowCount?: number;
  sort: { [column: string]: Order };
  onSort: (column: string, order: Order | null) => void;
  detailsPanel?: React.ComponentType<DetailsPanelProps>;
  actions?: React.ComponentType<TableActionProps>[];
  actionsWidth?: number;
  selectedRows?: number[];
  onCheck?: (selectedIds: number[]) => void;
  onUncheck?: (selectedIds: number[]) => void;
  allIds?: number[];
  disableSelectAll?: boolean;
}

const VirtualizedTable = (
  props: VirtualizedTableProps & WithStyles<typeof styles>
): React.ReactElement => {
  const [expandedIndex, setExpandedIndex] = React.useState(-1);
  const [detailPanelHeight, setDetailPanelHeight] = React.useState(rowHeight);
  const [lastChecked, setLastChecked] = React.useState(-1);

  let tableRef: Table | null = null;
  const detailPanelRef = React.useRef<HTMLDivElement>(null);

  const {
    actions,
    actionsWidth,
    classes,
    columns,
    data,
    selectedRows,
    allIds,
    onCheck,
    onUncheck,
    loadMoreRows,
    loading,
    totalRowCount,
    detailsPanel,
    sort,
    onSort,
    disableSelectAll,
  } = props;

  if (
    (loadMoreRows && typeof totalRowCount === 'undefined') ||
    (totalRowCount && typeof loadMoreRows === 'undefined')
  )
    throw new Error(
      'Only one of loadMoreRows and totalRowCount was defined - either define both for infinite loading functionality or neither for no infinite loading'
    );

  const [widthProps, setWidthProps] = React.useState<{
    [dataKey: string]: {
      width: number;
      flexGrow?: number;
      flexShrink?: number;
    };
  }>(
    columns.reduce(
      (
        result: {
          [dataKey: string]: {
            width: number;
            flexGrow: number;
            flexShrink: number;
          };
        },
        item
      ) => {
        result[item.dataKey] = {
          width: Math.max(
            window.innerWidth / columns.length,
            dataColumnMinWidth
          ),
          flexGrow: 1,
          flexShrink: 1,
        };
        return result;
      },
      {}
    )
  );

  const detailsPanelResize = React.useCallback((): void => {
    if (detailPanelRef && detailPanelRef.current) {
      setDetailPanelHeight(detailPanelRef.current.clientHeight);
    }
    if (tableRef) {
      tableRef.recomputeRowHeights();
    }
  }, [tableRef, setDetailPanelHeight]);

  React.useEffect(detailsPanelResize, [
    tableRef,
    expandedIndex,
    detailsPanelResize,
  ]);

  // Select the width to use for the actions column (if it was passed as a prop).
  const actionsColumnWidth = actionsWidth || actionsColumnDefaultWidth;

  const isRowLoaded = React.useCallback(
    ({ index }: Index): boolean => !!data[index],
    [data]
  );

  const getRowHeight = React.useCallback(
    ({ index }: Index): number =>
      index === expandedIndex ? rowHeight + detailPanelHeight : rowHeight,
    [detailPanelHeight, expandedIndex]
  );

  const getRowClassName = React.useCallback(
    ({ index }: Index): string =>
      clsx(
        classes.tableRow,
        classes.flexContainer,
        index > -1 && classes.tableRowHover
      ),
    [classes]
  );
  const getRow = React.useCallback(({ index }: Index): Entity => data[index], [
    data,
  ]);
  const renderRow: TableRowRenderer = React.useCallback(
    (props) => {
      if (detailsPanel && props.index === expandedIndex) {
        return (
          <DetailsPanelRow
            {...props}
            detailsPanel={detailsPanel}
            detailPanelRef={detailPanelRef}
            detailsPanelResize={detailsPanelResize}
          />
        );
      } else {
        return defaultTableRowRenderer(props);
      }
    },
    [detailsPanel, detailsPanelResize, expandedIndex]
  );

  const resizeColumn = React.useCallback(
    (dataKey: string, deltaX: number): void => {
      const thisColumn = widthProps[dataKey];
      thisColumn.flexGrow = 0;
      thisColumn.flexShrink = 0;
      thisColumn.width = Math.max(
        thisColumn.width + deltaX,
        dataColumnMinWidth
      );
      setWidthProps({
        ...widthProps,
        [dataKey]: thisColumn,
      });
    },
    [widthProps, setWidthProps]
  );

  return (
    <AutoSizer>
      {({ height, width }) => {
        let min_table_width = Object.values(widthProps).reduce(
          (result, item) => {
            if (item.flexShrink === 0 && item.flexGrow === 0) {
              result += item.width;
            } else {
              result += dataColumnMinWidth;
            }
            return result;
          },
          0
        );
        min_table_width +=
          (selectedRows && onCheck && onUncheck ? selectColumnWidth : 0) +
          (detailsPanel ? detailsColumnWidth : 0) +
          (actions ? actionsColumnWidth : 0);
        const rowCount = totalRowCount || data.length;
        return (
          <InfiniteLoader
            isRowLoaded={isRowLoaded}
            loadMoreRows={loadMoreRows || (() => Promise.resolve())}
            rowCount={rowCount}
            minimumBatchSize={25}
          >
            {({ onRowsRendered, registerChild }) => (
              <Table
                ref={(ref) => {
                  tableRef = ref;
                  registerChild(ref);
                }}
                className={classes.table}
                height={(height || 500) - scrollBarHeight}
                width={Math.max(width, min_table_width)}
                rowCount={data.length}
                onRowsRendered={onRowsRendered}
                headerHeight={headerHeight}
                rowHeight={getRowHeight}
                rowClassName={getRowClassName}
                rowGetter={getRow}
                rowRenderer={renderRow}
              >
                {selectedRows && onCheck && onUncheck && (
                  <Column
                    width={selectColumnWidth}
                    flexShrink={0}
                    key="Select"
                    dataKey="Select"
                    headerRenderer={(props) =>
                      !disableSelectAll && (
                        <SelectHeader
                          {...props}
                          className={clsx(
                            classes.headerTableCell,
                            classes.headerFlexContainer
                          )}
                          selectedRows={selectedRows}
                          totalRowCount={rowCount}
                          allIds={
                            allIds ||
                            data.map((d) => {
                              const icatEntity = d as ICATEntity;
                              return icatEntity.id;
                            })
                          }
                          loading={loading}
                          onCheck={onCheck}
                          onUncheck={onUncheck}
                        />
                      )
                    }
                    className={classes.flexContainer}
                    headerClassName={classes.headerFlexContainer}
                    cellRenderer={(props) => (
                      <SelectCell
                        {...props}
                        selectedRows={selectedRows}
                        data={data}
                        className={clsx(
                          classes.tableCell,
                          classes.flexContainer
                        )}
                        onCheck={onCheck}
                        onUncheck={onUncheck}
                        lastChecked={lastChecked}
                        setLastChecked={setLastChecked}
                        loading={loading}
                      />
                    )}
                  />
                )}
                {detailsPanel && (
                  <Column
                    width={detailsColumnWidth}
                    flexShrink={0}
                    key="Expand"
                    dataKey="expand"
                    headerRenderer={() => (
                      <TableCell
                        size="small"
                        padding="checkbox"
                        component="div"
                        className={clsx(
                          classes.headerTableCell,
                          classes.flexContainer
                        )}
                        variant="head"
                      />
                    )}
                    className={classes.flexContainer}
                    headerClassName={classes.headerFlexContainer}
                    cellRenderer={(props) => (
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
                    icon,
                    filterComponent,
                    disableSort,
                  }) => {
                    return (
                      <Column
                        key={dataKey}
                        dataKey={dataKey}
                        label={label}
                        disableSort={disableSort}
                        headerClassName={classes.headerFlexContainer}
                        headerRenderer={(headerProps) => (
                          <DataHeader
                            {...headerProps}
                            className={clsx(
                              classes.headerTableCell,
                              classes.headerFlexContainer
                            )}
                            sort={sort}
                            onSort={onSort}
                            icon={icon}
                            labelString={label}
                            filterComponent={filterComponent}
                            resizeColumn={resizeColumn}
                          />
                        )}
                        className={clsx(classes.flexContainer, className)}
                        cellRenderer={(props) => (
                          <DataCell
                            {...props}
                            cellContentRenderer={cellContentRenderer}
                            className={clsx(
                              classes.tableCell,
                              classes.flexContainer
                            )}
                          />
                        )}
                        minWidth={dataColumnMinWidth}
                        {...widthProps[dataKey]}
                      />
                    );
                  }
                )}
                {actions && (
                  <Column
                    width={actionsColumnWidth}
                    flexShrink={0}
                    key="Actions"
                    dataKey="actions"
                    className={classes.flexContainer}
                    headerClassName={classes.headerFlexContainer}
                    headerRenderer={(headerProps) => (
                      <TableCell
                        size="small"
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
                    cellRenderer={(props) => (
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
          </InfiniteLoader>
        );
      }}
    </AutoSizer>
  );
};
VirtualizedTable.whyDidYouRender = true;

export default withStyles(styles)(VirtualizedTable);
