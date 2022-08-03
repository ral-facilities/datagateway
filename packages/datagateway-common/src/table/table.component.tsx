import React from 'react';
import TableCell from '@mui/material/TableCell';
import { styled, SxProps, Theme, useTheme } from '@mui/material/styles';
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
import { Entity, Order, ICATEntity, UpdateMethod } from '../app.types';
import ExpandCell from './cellRenderers/expandCell.component';
import DataCell from './cellRenderers/dataCell.component';
import ActionCell from './cellRenderers/actionCell.component';
import DataHeader from './headerRenderers/dataHeader.component';
import DetailsPanelRow from './rowRenderers/detailsPanelRow.component';
import SelectCell from './cellRenderers/selectCell.component';
import SelectHeader from './headerRenderers/selectHeader.component';

const rowHeight = 30;
const headerHeight = 148;
const selectColumnWidth = 40;
const detailsColumnWidth = 40;
const actionsColumnDefaultWidth = 70;
const scrollBarHeight = 17;
const dataColumnMinWidth = 84;

const StyledTable = styled(Table)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
}));

const flexContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  boxSizing: 'border-box' as const,
};

const headerFlexContainerStyle = {
  display: 'flex',
  flexDirection: 'row',
  boxSizing: 'border-box',
  overflow: 'hidden',
};

const tableRowStyle = {};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getTableRowHoverStyle = (theme: Theme) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
});

const tableCellStyle = {
  flex: 1,
  overflow: 'hidden',
  height: rowHeight,
  padding: 0,
  paddingLeft: '16px',
  '&:lastChild': {
    paddingRight: 0,
  },
};

const tableReducedPaddingStyle = {
  paddingLeft: '8px',
};

const headerTableCellStyle = {
  flex: 1,
  height: headerHeight,
  justifyContent: 'space-between',
  padding: 0,
  paddingLeft: '16px',
  '&:lastChild': {
    paddingRight: 0,
  },
};

const shortHeaderTableCellStyle = {
  flex: 1,
  height: rowHeight,
  justifyContent: 'space-between',
  padding: 0,
  paddingLeft: 16,
  '&:last-child': {
    paddingRight: 0,
  },
};

const tableCellStyleCombined = { ...tableCellStyle, ...flexContainerStyle };
const tableCellReducedPaddingStyleCombined = {
  ...tableCellStyle,
  ...tableReducedPaddingStyle,
  ...flexContainerStyle,
};
const headerTableCellStyleCombined = {
  ...headerTableCellStyle,
  ...headerFlexContainerStyle,
};

export interface ColumnType {
  label: string;
  dataKey: string;
  icon?: React.ComponentType<unknown>;
  cellContentRenderer?: TableCellRenderer;
  className?: string;
  disableSort?: boolean;
  defaultSort?: Order;
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
  loading?: boolean;
  data: Entity[];
  columns: ColumnType[];
  loadMoreRows?: (offsetParams: IndexRange) => Promise<unknown>;
  totalRowCount?: number;
  sort: { [column: string]: Order };
  onSort: (
    column: string,
    order: Order | null,
    updateMethod: UpdateMethod
  ) => void;
  detailsPanel?: React.ComponentType<DetailsPanelProps>;
  actions?: React.ComponentType<TableActionProps>[];
  actionsWidth?: number;
  selectedRows?: number[];
  onCheck?: (selectedIds: number[]) => void;
  onUncheck?: (selectedIds: number[]) => void;
  allIds?: number[];
  disableSelectAll?: boolean;
  shortHeader?: boolean;
}

const VirtualizedTable = React.memo(
  (props: VirtualizedTableProps): React.ReactElement => {
    const [expandedIndex, setExpandedIndex] = React.useState(-1);
    const [detailPanelHeight, setDetailPanelHeight] = React.useState(rowHeight);
    const [lastChecked, setLastChecked] = React.useState(-1);
    const theme = useTheme();

    let tableRef: Table | null = null;
    const detailPanelRef = React.useRef<HTMLDivElement>(null);

    const {
      actions,
      actionsWidth,
      columns,
      data,
      selectedRows,
      allIds,
      onCheck,
      onUncheck,
      loading,
      totalRowCount,
      detailsPanel,
      sort,
      onSort,
      disableSelectAll,
      shortHeader,
    } = props;

    if (
      (props.loadMoreRows && typeof totalRowCount === 'undefined') ||
      (totalRowCount && typeof props.loadMoreRows === 'undefined')
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

    const getRowStyle = React.useCallback(
      ({ index }: Index): React.CSSProperties => {
        const tableRowHoverStyle =
          index > -1 ? getTableRowHoverStyle(theme) : {};
        return {
          ...tableRowStyle,
          ...flexContainerStyle,
          ...tableRowHoverStyle,
        };
      },
      [theme]
    );
    const getRow = React.useCallback(
      ({ index }: Index): Entity => data[index],
      [data]
    );
    const renderRow: TableRowRenderer = React.useCallback(
      (props) => {
        // eslint-disable-next-line react/prop-types
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

    const loadMoreRows = React.useMemo(
      () => props.loadMoreRows || (() => Promise.resolve()),
      [props.loadMoreRows]
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
              loadMoreRows={loadMoreRows}
              rowCount={rowCount}
              minimumBatchSize={25}
            >
              {({ onRowsRendered, registerChild }) => (
                <StyledTable
                  ref={(ref) => {
                    if (ref !== null) {
                      tableRef = ref;
                    }
                    return registerChild(ref);
                  }}
                  height={(height || 500) - scrollBarHeight}
                  width={Math.max(width, min_table_width)}
                  rowCount={data.length}
                  onRowsRendered={onRowsRendered}
                  headerHeight={shortHeader ? rowHeight : headerHeight}
                  rowHeight={getRowHeight}
                  rowStyle={getRowStyle}
                  rowGetter={getRow}
                  rowRenderer={renderRow}
                  // Disable tab focus on whole table for accessibility;
                  // prevents screen readers outputting table contents on focus.
                  tabIndex={-1}
                >
                  {onCheck && onUncheck && (
                    <Column
                      width={selectColumnWidth}
                      flexShrink={0}
                      key="Select"
                      dataKey="Select"
                      headerRenderer={(props) =>
                        !disableSelectAll && (
                          <SelectHeader
                            {...props}
                            sx={
                              {
                                ...headerTableCellStyleCombined,
                                ...(shortHeader
                                  ? shortHeaderTableCellStyle
                                  : {}),
                              } as SxProps
                            }
                            selectedRows={selectedRows}
                            totalRowCount={rowCount}
                            allIds={
                              allIds ||
                              data.map((d) => {
                                const icatEntity = d as ICATEntity;
                                return icatEntity.id;
                              })
                            }
                            loading={loading ?? false}
                            onCheck={onCheck}
                            onUncheck={onUncheck}
                          />
                        )
                      }
                      style={flexContainerStyle as React.CSSProperties}
                      headerStyle={
                        headerFlexContainerStyle as React.CSSProperties
                      }
                      cellRenderer={(props) => (
                        <SelectCell
                          {...props}
                          selectedRows={selectedRows}
                          data={data}
                          sx={tableCellStyleCombined as SxProps}
                          onCheck={onCheck}
                          onUncheck={onUncheck}
                          lastChecked={lastChecked}
                          setLastChecked={setLastChecked}
                          loading={loading ?? false}
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
                          sx={
                            {
                              ...headerTableCellStyleCombined,
                              ...flexContainerStyle,
                              ...(shortHeader ? shortHeaderTableCellStyle : {}),
                            } as SxProps
                          }
                          variant="head"
                        />
                      )}
                      style={flexContainerStyle as React.CSSProperties}
                      headerStyle={
                        headerFlexContainerStyle as React.CSSProperties
                      }
                      cellRenderer={(props) => (
                        <ExpandCell
                          {...props}
                          expandedIndex={expandedIndex}
                          setExpandedIndex={setExpandedIndex}
                          sx={tableCellStyleCombined}
                        />
                      )}
                    />
                  )}
                  {columns.map(
                    (
                      {
                        cellContentRenderer,
                        className,
                        dataKey,
                        label,
                        icon,
                        filterComponent,
                        disableSort,
                        defaultSort,
                      },
                      index
                    ) => {
                      return (
                        <Column
                          key={dataKey}
                          dataKey={dataKey}
                          label={label}
                          disableSort={disableSort}
                          headerStyle={
                            headerFlexContainerStyle as React.CSSProperties
                          }
                          headerClassName={`tour-dataview-filter`}
                          headerRenderer={(headerProps) => (
                            <DataHeader
                              {...headerProps}
                              sx={headerTableCellStyleCombined as SxProps}
                              sort={sort}
                              onSort={onSort}
                              icon={icon}
                              labelString={label}
                              filterComponent={filterComponent}
                              resizeColumn={resizeColumn}
                              defaultSort={defaultSort}
                            />
                          )}
                          className={className}
                          cellRenderer={(props) => (
                            <DataCell
                              {...props}
                              cellContentRenderer={cellContentRenderer}
                              sx={
                                //Remove padding only when in the first column and there is another element displayed before it e.g. a checkbox
                                ((selectedRows && onCheck && onUncheck) ||
                                  detailsPanel) &&
                                index === 0
                                  ? tableCellReducedPaddingStyleCombined
                                  : tableCellStyleCombined
                              }
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
                      style={flexContainerStyle as React.CSSProperties}
                      headerStyle={
                        headerFlexContainerStyle as React.CSSProperties
                      }
                      headerRenderer={(headerProps) => (
                        <TableCell
                          size="small"
                          component="div"
                          sx={headerTableCellStyleCombined as SxProps}
                          variant="head"
                        >
                          Actions
                        </TableCell>
                      )}
                      cellRenderer={(props) => (
                        <ActionCell
                          {...props}
                          actions={actions}
                          sx={tableCellStyleCombined as SxProps}
                        />
                      )}
                    />
                  )}
                </StyledTable>
              )}
            </InfiniteLoader>
          );
        }}
      </AutoSizer>
    );
  }
);
VirtualizedTable.displayName = 'VirtualizedTable';

export default VirtualizedTable;
