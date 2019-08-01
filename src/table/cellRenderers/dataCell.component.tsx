import React from 'react';
import { TableCellProps, TableCellRenderer } from 'react-virtualized';
import { TableCell, Typography } from '@material-ui/core';

type CellRendererProps = TableCellProps & {
  className: string;
  cellContentRenderer?: TableCellRenderer;
};

const DataCell = (props: CellRendererProps): React.ReactElement => {
  const { className, dataKey, rowData, cellContentRenderer } = props;

  // use . in dataKey name to drill down into nested row data
  const cellValue = dataKey.split('.').reduce(function(prev, curr) {
    return prev ? prev[curr] : null;
  }, rowData);

  return (
    <TableCell component="div" className={className} variant="body">
      <Typography variant="body2" noWrap>
        {cellContentRenderer ? cellContentRenderer(props) : cellValue}
      </Typography>
    </TableCell>
  );
};

export default DataCell;
