import React from 'react';
import { TableCellProps, TableCellRenderer } from 'react-virtualized';
import { Divider, SxProps, TableCell, Typography } from '@mui/material';
import ArrowTooltip, { getTooltipText } from '../../arrowtooltip.component';

type CellRendererProps = TableCellProps & {
  sx: SxProps;
  cellContentRenderer?: TableCellRenderer;
};

const DataCell = React.memo((props: CellRendererProps): React.ReactElement => {
  const { sx, dataKey, rowData, cellContentRenderer } = props;

  // use . in dataKey name to drill down into nested row data
  // if cellContentRenderer not provided
  const cellContent = cellContentRenderer
    ? cellContentRenderer(props)
    : dataKey.split('.').reduce(function (prev, curr) {
        return prev ? prev[curr] : null;
      }, rowData);

  return (
    <TableCell size="small" component="div" sx={sx} variant="body">
      <ArrowTooltip
        title={getTooltipText(cellContent)}
        enterDelay={500}
        sx={{ flex: 1 }}
      >
        <Typography variant="body2" noWrap>
          {cellContent}
        </Typography>
      </ArrowTooltip>
      <div
        style={{
          marginLeft: 18,
          paddingLeft: '4px',
          paddingRight: '4px',
          height: '100%',
        }}
      >
        <Divider
          orientation="vertical"
          flexItem
          sx={{
            height: '100%',
          }}
        />
      </div>
    </TableCell>
  );
});
DataCell.displayName = 'DataCell';

export default DataCell;
