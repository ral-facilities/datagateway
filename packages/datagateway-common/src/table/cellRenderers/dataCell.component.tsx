import React from 'react';
import { TableCellProps, TableCellRenderer } from 'react-virtualized';
import {
  Divider,
  TableCell,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import ArrowTooltip, { getTooltipText } from '../../arrowtooltip.component';

type CellRendererProps = TableCellProps & {
  className: string;
  cellContentRenderer?: TableCellRenderer;
};

const DataCell = React.memo(
  (props: CellRendererProps): React.ReactElement => {
    const { className, dataKey, rowData, cellContentRenderer } = props;

    // use . in dataKey name to drill down into nested row data
    // if cellContentRenderer not provided
    const cellContent = cellContentRenderer
      ? cellContentRenderer(props)
      : dataKey.split('.').reduce(function (prev, curr) {
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
        <ArrowTooltip
          title={getTooltipText(cellContent)}
          enterDelay={500}
          style={{ flex: 1 }}
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
            style={{
              height: '100%',
            }}
          />
        </div>
      </TableCell>
    );
  }
);
DataCell.displayName = 'DataCell';

export default DataCell;
