import React from 'react';
import { TableCellProps } from 'react-virtualized';
import { TableCell, IconButton, SxProps } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

type ExpandCellProps = TableCellProps & {
  expandedIndex: number;
  setExpandedIndex: (expandedIndex: number) => void;
  sx: SxProps;
};

const ExpandCell = React.memo(
  (props: ExpandCellProps): React.ReactElement => {
    const { sx, expandedIndex, setExpandedIndex } = props;

    return (
      <TableCell
        size="small"
        padding="checkbox"
        component="div"
        sx={sx}
        variant="body"
      >
        {props.rowIndex !== expandedIndex ? (
          <IconButton
            className="tour-dataview-expand"
            aria-label="Show details"
            onClick={() => setExpandedIndex(props.rowIndex)}
            size="large"
          >
            <ExpandMore />
          </IconButton>
        ) : (
          <IconButton
            aria-label="Hide details"
            onClick={() => setExpandedIndex(-1)}
            size="large"
          >
            <ExpandLess />
          </IconButton>
        )}
      </TableCell>
    );
  }
);
ExpandCell.displayName = 'ExpandCell';

export default ExpandCell;
