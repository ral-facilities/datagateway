import React from 'react';
import { Order, UpdateMethod } from '../../app.types';
import { TableHeaderProps } from 'react-virtualized';
import {
  TableCell,
  TableSortLabel,
  Box,
  Typography,
  Divider,
} from '@material-ui/core';
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

    const currSortDirection = sort[dataKey];

    //Apply default sort on page load (but only if not already defined in URL params)
    //This will apply them in the order of the column definitions given to a table
    React.useEffect(() => {
      if (defaultSort !== undefined && currSortDirection === undefined)
        onSort(dataKey, defaultSort, 'replace');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    return (
      <TableCell
        size="small"
        component="div"
        className={className}
        variant="head"
        sortDirection={currSortDirection}
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
          <div
            style={{
              marginLeft: 18,
              paddingLeft: '4px',
              paddingRight: '4px',
              cursor: 'col-resize',
            }}
          >
            <Divider
              orientation="vertical"
              flexItem
              style={{
                height: '100%',
              }}
            />
          </div>
        </Draggable>
      </TableCell>
    );
  }
);
DataHeader.displayName = 'DataHeader';

export default DataHeader;
