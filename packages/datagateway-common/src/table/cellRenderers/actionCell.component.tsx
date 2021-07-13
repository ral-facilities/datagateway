import React from 'react';
import { TableCellProps } from 'react-virtualized';
import { TableCell } from '@material-ui/core';
import { TableActionProps } from '../table.component';

type CellRendererProps = TableCellProps & {
  className: string;
  actions: React.ComponentType<TableActionProps>[];
};

const ActionCell = React.memo(
  (props: CellRendererProps): React.ReactElement => {
    const { className, actions, rowData } = props;

    return (
      <TableCell
        size="medium"
        padding="checkbox"
        component="div"
        className={className}
        variant="body"
      >
        {actions.map((TableAction, index) => (
          <TableAction key={index} rowData={rowData} />
        ))}
      </TableCell>
    );
  }
);
ActionCell.displayName = 'ActionCell';

export default ActionCell;
