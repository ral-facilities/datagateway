import React from 'react';
import { Order } from '../../app.types';
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

const DataHeader = (
  props: TableHeaderProps & {
    className: string;
    sort: { [column: string]: Order };
    onSort: (column: string, order: Order | null) => void;
    resizeColumn: (deltaX: number) => void;
    icon?: JSX.Element;
    filterComponent?: React.ReactElement;
    disableHeaderWrap?: boolean;
  }
): React.ReactElement => {
  const {
    className,
    dataKey,
    sort,
    onSort,
    label,
    disableSort,
    resizeColumn,
    icon,
    filterComponent,
    disableHeaderWrap,
  } = props;

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
      active={dataKey in sort}
      direction={currSortDirection}
      onClick={() => onSort(dataKey, nextSortDirection)}
    >
      <Typography noWrap style={{ fontSize: 'inherit', lineHeight: 'inherit' }}>
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
        <Box display="flex" flexWrap={disableHeaderWrap ? 'nowrap' : 'wrap'}>
          <Box marginRight={1}>{icon}</Box>
          <Box>{inner}</Box>
        </Box>
        {filterComponent}
      </div>
      <Draggable
        axis="none"
        onDrag={(event, { deltaX }) => resizeColumn(deltaX)}
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
};

export default DataHeader;
