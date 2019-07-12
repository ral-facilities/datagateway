import React from 'react';
import { Order } from '../../state/app.types';
import { TableHeaderProps, SortDirection } from 'react-virtualized';
import { TableCell, TableSortLabel } from '@material-ui/core';

const DataHeader = (
  props: TableHeaderProps & {
    headerHeight: number;
    className: string;
    filterComponent?: React.ReactElement;
    sort: { [column: string]: Order };
    onSort: (column: string, order: Order | null) => void;
  }
): React.ReactElement => {
  const {
    headerHeight,
    className,
    dataKey,
    filterComponent,
    sort,
    onSort,
  } = props;

  const currSortDirection = sort[dataKey] ? sort[dataKey] : null;
  let nextSortDirection: Order | null = null;
  switch (currSortDirection) {
    case 'asc':
      nextSortDirection = 'desc';
      break;
    case 'desc':
      nextSortDirection = null;
      break;
    case null:
      nextSortDirection = 'asc';
  }

  const inner = !props.disableSort ? (
    <TableSortLabel
      active={props.dataKey in sort}
      direction={sort[dataKey]}
      onClick={() => onSort(dataKey, nextSortDirection)}
    >
      {props.label}
    </TableSortLabel>
  ) : (
    props.label
  );

  return (
    <TableCell
      component="div"
      className={className}
      variant="head"
      style={{ height: headerHeight }}
      sortDirection={sort[dataKey] ? sort[dataKey] : false}
    >
      {inner}
      {filterComponent}
    </TableCell>
  );
};

export default DataHeader;
