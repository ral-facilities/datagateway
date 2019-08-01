import React from 'react';
import { TableCellProps } from 'react-virtualized';
import { TableCell } from '@material-ui/core';
import { Entity } from '../../state/app.types';

type CellRendererProps = TableCellProps & {
  className: string;
  actions: ((rowData: Entity) => React.ReactElement)[];
};

const ActionCell = (props: CellRendererProps): React.ReactElement => {
  const { className, actions, rowData } = props;

  return (
    <TableCell component="div" className={className} variant="body">
      {actions.map(element => element(rowData))}
    </TableCell>
  );
};

export default ActionCell;
