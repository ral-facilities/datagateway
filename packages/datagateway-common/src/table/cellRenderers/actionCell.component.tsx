import React from 'react';
import { TableCellProps } from 'react-virtualized';
import { SxProps, TableCell } from '@mui/material';
import { TableActionProps } from '../table.component';

type CellRendererProps = TableCellProps & {
  sx: SxProps;
  actions: React.ComponentType<TableActionProps>[];
};

const ActionCell = React.memo(
  (props: CellRendererProps): React.ReactElement => {
    const { sx, actions, rowData } = props;

    return (
      <TableCell size="medium" component="div" sx={sx} variant="body">
        {actions.map((TableAction, index) => (
          <TableAction key={index} rowData={rowData} />
        ))}
      </TableCell>
    );
  }
);
ActionCell.displayName = 'ActionCell';

export default ActionCell;
