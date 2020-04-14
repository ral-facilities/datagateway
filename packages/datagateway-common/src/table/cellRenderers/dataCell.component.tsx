import React from 'react';
import { TableCellProps, TableCellRenderer } from 'react-virtualized';
import { TableCell, Typography } from '@material-ui/core';
import ArrowTooltip from '../../arrowtooltip.component';

type CellRendererProps = TableCellProps & {
  className: string;
  contentClassName: string;
  cellContentRenderer?: TableCellRenderer;
};

const DataCell = (props: CellRendererProps): React.ReactElement => {
  const {
    className,
    contentClassName,
    dataKey,
    rowData,
    cellContentRenderer,
  } = props;

  // use . in dataKey name to drill down into nested row data
  const cellValue = dataKey.split('.').reduce(function(prev, curr) {
    return prev ? prev[curr] : null;
  }, rowData);

  return (
    <ArrowTooltip title={cellValue}>
      <TableCell
        size="small"
        component="div"
        className={className}
        variant="body"
      >
        <Typography className={contentClassName} variant="body2" noWrap>
          {cellContentRenderer ? cellContentRenderer(props) : cellValue}
        </Typography>
      </TableCell>
    </ArrowTooltip>
  );
};

export default DataCell;
