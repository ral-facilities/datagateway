import React from 'react';
import { TableCellProps } from 'react-virtualized';
import { TableCell } from '@material-ui/core';
import { Entity } from '../../state/app.types';

type CellRendererProps = TableCellProps & {
  rowHeight: number;
  className: string;
  actions: ((rowData: Entity) => React.ReactElement)[];
};

const ActionCell = (props: CellRendererProps): React.ReactElement => {
  const { className, rowHeight, actions, rowData } = props;

  return (
    <TableCell
      component="div"
      className={className}
      variant="body"
      style={{ height: rowHeight }}
    >
      {actions !== undefined && actions.map(element => element(rowData))}
    </TableCell>
  );
};

export default ActionCell;
