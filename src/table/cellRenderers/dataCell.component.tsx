import React from 'react';
import { TableCellProps } from 'react-virtualized';
import { TableCell, Typography } from '@material-ui/core';

type CellRendererProps = TableCellProps & {
  className: string;
};

const DataCell = (props: CellRendererProps): React.ReactElement => {
  const { className, dataKey, rowData, cellData } = props;

  let cellValue;
  if (dataKey.indexOf('.') !== -1) {
    cellValue = dataKey.split('.').reduce(function(prev, curr) {
      return prev ? prev[curr] : null;
    }, rowData);
  } else {
    cellValue = cellData;
  }

  return (
    <TableCell component="div" className={className} variant="body">
      <Typography variant="body2" noWrap>
        {cellValue}
      </Typography>
    </TableCell>
  );
};

export default DataCell;
