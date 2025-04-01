import React from 'react';
import {
  Filter,
  FiltersType,
  Order,
  SortType,
  UpdateMethod,
} from '../../app.types';
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
    sort: SortType;
    onSort: (
      column: string,
      order: Order | null,
      defaultSort: UpdateMethod,
      shiftDown?: boolean
    ) => void;
    resizeColumn: (dataKey: string, deltaX: number) => void;
    labelString: string;
    icon?: React.ElementType;
    filterComponent?: (
      label: string,
      dataKey: string,
      defaultFilter?: Filter
    ) => React.ReactElement;
    defaultSort?: Order;
    shiftDown?: boolean;
    defaultFilter?: Filter;
    onDefaultFilter?: (column: string, filter: Filter | null) => void;
    filters?: FiltersType;
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
    defaultFilter,
    onDefaultFilter,
    filters,
  } = props;

  const currSortDirection = sort[dataKey];

  const [hover, setHover] = React.useState(false);

  const shouldApplyDefaultFilter =
    typeof defaultFilter !== 'undefined' &&
    typeof onDefaultFilter !== 'undefined' &&
    typeof filters !== 'undefined' &&
    Object.keys(filters).length === 0;

  //Apply default sort & filter on page load (but only if not already defined in URL params)
  //This will apply them in the order of the column definitions given to a table
  React.useEffect(() => {
    if (typeof defaultSort !== 'undefined' && Object.keys(sort).length === 0)
      onSort(dataKey, defaultSort, 'replace', false);
    if (shouldApplyDefaultFilter) onDefaultFilter(dataKey, defaultFilter);
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
      aria-label={labelString}
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
        {filterComponent?.(
          labelString,
          dataKey,
          shouldApplyDefaultFilter ? defaultFilter : undefined
        )}
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
