import React from 'react';
import { Order, UpdateMethod } from '../../app.types';
import { TableHeaderProps } from 'react-virtualized';
import {
  TableCell,
  TableSortLabel,
  Box,
  Typography,
  Divider,
  SxProps,
} from '@mui/material';
import { StyledTooltip } from '../../arrowtooltip.component';
import Draggable from 'react-draggable';
import SortIcon from '@mui/icons-material/Sort';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const DataHeader = (
  props: TableHeaderProps & {
    sx: SxProps;
    sort: { [column: string]: Order };
    onSort: (
      column: string,
      order: Order | null,
      defaultSort: UpdateMethod,
      shiftDown?: boolean
    ) => void;
    resizeColumn: (dataKey: string, deltaX: number) => void;
    labelString: string;
    icon?: React.ComponentType<unknown>;
    filterComponent?: (label: string, dataKey: string) => React.ReactElement;
    defaultSort?: Order;
    shiftDown?: boolean;
  }
): React.ReactElement => {
  const {
    sx,
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
    shiftDown,
  } = props;

  const currSortDirection = sort[dataKey];

  const [hover, setHover] = React.useState(false);

  //Apply default sort on page load (but only if not already defined in URL params)
  //This will apply them in the order of the column definitions given to a table
  React.useEffect(() => {
    if (defaultSort !== undefined && currSortDirection === undefined)
      onSort(dataKey, defaultSort, 'replace', false);
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
    <StyledTooltip
      title={shiftDown ? 'Multisort' : 'Sort'}
      aria-label={labelString}
    >
      <TableSortLabel
        className={'tour-dataview-sort'}
        active={true}
        direction={!(dataKey in sort) ? 'desc' : currSortDirection}
        onClick={(event) => {
          onSort(dataKey, nextSortDirection, 'push', event.shiftKey);
          if (!(dataKey in sort)) setHover(false);
        }}
        {...(!(dataKey in sort)
          ? {
              onMouseEnter: () => setHover(true),
              onMouseLeave: () => setHover(false),
              IconComponent: hover
                ? ArrowUpwardIcon
                : shiftDown
                ? AddIcon
                : SortIcon,
              sx: {
                transition: 'opacity 0.5s',
                opacity: hover ? 0.7 : 1,
              },
            }
          : {})}
      >
        <Typography noWrap sx={{ fontSize: 'inherit', lineHeight: 'inherit' }}>
          {label}
        </Typography>
      </TableSortLabel>
    </StyledTooltip>
  ) : (
    <Typography noWrap sx={{ fontSize: 'inherit', lineHeight: 'inherit' }}>
      {label}
    </Typography>
  );

  return (
    <TableCell
      size="small"
      component="div"
      sx={sx}
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
            sx={{
              height: '100%',
            }}
          />
        </div>
      </Draggable>
    </TableCell>
  );
};

DataHeader.displayName = 'DataHeader';

export default DataHeader;
