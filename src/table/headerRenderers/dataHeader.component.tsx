import React from 'react';
import { Order } from '../../state/app.types';
import { TableHeaderProps } from 'react-virtualized';
import { TableCell, TableSortLabel } from '@material-ui/core';

const DataHeader = (
  props: TableHeaderProps & {
    className: string;
    filterComponent?: React.ReactElement;
    sort: { [column: string]: Order };
    onSort: (column: string, order: Order | null) => void;
  }
): React.ReactElement => {
  const {
    className,
    dataKey,
    filterComponent,
    sort,
    onSort,
    label,
    disableSort,
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

  const inner = !disableSort ? (
    <TableSortLabel
      active={dataKey in sort}
      direction={sort[dataKey]}
      onClick={() => onSort(dataKey, nextSortDirection)}
      style={{ flexDirection: 'row' }}
    >
      {label}
    </TableSortLabel>
  ) : (
    label
  );

  return (
    <TableCell
      component="div"
      className={className}
      variant="head"
      sortDirection={sort[dataKey] ? sort[dataKey] : false}
    >
      {inner}
      {filterComponent}
    </TableCell>
  );
};

export default DataHeader;
