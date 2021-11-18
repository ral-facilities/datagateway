import React from 'react';
import { Order, UpdateMethod } from '../../app.types';
import { TableHeaderProps } from 'react-virtualized';
import {
  TableCell,
  TableSortLabel,
  Box,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import { DragIndicator } from '@material-ui/icons';
import Draggable from 'react-draggable';

const DataHeader = React.memo(
  (
    props: TableHeaderProps & {
      className: string;
      sort: { [column: string]: Order };
      onSort: (
        column: string,
        order: Order | null,
        defaultSort: UpdateMethod
      ) => void;
      resizeColumn: (dataKey: string, deltaX: number) => void;
      labelString: string;
      icon?: React.ComponentType<unknown>;
      filterComponent?: (label: string, dataKey: string) => React.ReactElement;
      defaultSort?: Order;
    }
  ): React.ReactElement => {
    const {
      className,
      dataKey,
      sort,
      onSort,
      label,
      labelString,
      disableSort,
      defaultSort,
      resizeColumn,
      icon: Icon,
      filterComponent,
    } = props;

    //Apply default sort on page load
    React.useEffect(() => {
      const defaultSortProvided = defaultSort !== undefined;
      if (defaultSortProvided)
        onSort(
          dataKey,
          defaultSort !== undefined ? defaultSort : null,
          defaultSortProvided ? 'replace' : 'push'
        );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const currSortDirection = sort[dataKey];
    let nextSortDirection: Order | null = null;
    switch (currSortDirection) {
      case 'asc':
        nextSortDirection = 'desc';
        break;
      case 'desc':
        nextSortDirection = null;
        break;
      case undefined:
        nextSortDirection = 'asc';
    }

    const inner = !disableSort ? (
      <TableSortLabel
        className={'tour-dataview-sort'}
        active={dataKey in sort}
        direction={currSortDirection}
        onClick={() => onSort(dataKey, nextSortDirection, 'push')}
      >
        <Typography
          noWrap
          style={{ fontSize: 'inherit', lineHeight: 'inherit' }}
        >
          {label}
        </Typography>
      </TableSortLabel>
    ) : (
      <Typography noWrap style={{ fontSize: 'inherit', lineHeight: 'inherit' }}>
        {label}
      </Typography>
    );

    const smWindow = !useMediaQuery('(min-width: 960px)');

    return (
      <TableCell
        size="small"
        component="div"
        className={className}
        variant="head"
        sortDirection={currSortDirection}
        style={smWindow ? { paddingLeft: 8, paddingRight: 8 } : {}}
      >
        <div
          style={{
            overflow: 'hidden',
            flex: 1,
          }}
        >
          <Box display="flex">
            <Box marginRight={1}>{Icon && <Icon />}</Box>
            <Box>{inner}</Box>
          </Box>
          {filterComponent?.(labelString, dataKey)}
        </div>
        <Draggable
          axis="none"
          onDrag={(event, { deltaX }) => resizeColumn(dataKey, deltaX)}
          onStop={() => {
            const event = new Event('columnResize');
            window.dispatchEvent(event);
          }}
        >
          <DragIndicator
            fontSize="small"
            style={{
              cursor: 'col-resize',
            }}
          />
        </Draggable>
      </TableCell>
    );
  }
);
DataHeader.displayName = 'DataHeader';

export default DataHeader;
