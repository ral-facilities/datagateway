import React from 'react';
import { TableCellProps, TableCellRenderer } from 'react-virtualized';
import { TableCell, Typography, useMediaQuery } from '@material-ui/core';
import ArrowTooltip from '../../arrowtooltip.component';

type CellRendererProps = TableCellProps & {
  className: string;
  cellContentRenderer?: TableCellRenderer;
};

const DataCell = (props: CellRendererProps): React.ReactElement => {
  const { className, dataKey, rowData, cellContentRenderer } = props;

  // use . in dataKey name to drill down into nested row data
  const cellValue = dataKey.split('.').reduce(function (prev, curr) {
    return prev ? prev[curr] : null;
  }, rowData);

  const smWindow = !useMediaQuery('(min-width: 960px)');
  return (
    <TableCell
      size="small"
      component="div"
      className={className}
      variant="body"
      style={smWindow ? { paddingLeft: 8, paddingRight: 8 } : {}}
    >
      <ArrowTooltip title={cellValue} enterDelay={500}>
        <Typography variant="body2" noWrap>
          {cellContentRenderer ? cellContentRenderer(props) : cellValue}
        </Typography>
      </ArrowTooltip>
    </TableCell>
  );
};

export default DataCell;
