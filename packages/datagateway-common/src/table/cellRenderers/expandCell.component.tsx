import React from 'react';
import { TableCellProps } from 'react-virtualized';
import { TableCell, IconButton } from '@material-ui/core';
import { ExpandMore, ExpandLess } from '@material-ui/icons';

type ExpandCellProps = TableCellProps & {
  expandedIndex: number;
  setExpandedIndex: (expandedIndex: number) => void;
  className: string;
};

const ExpandCell = (props: ExpandCellProps): React.ReactElement => {
  const { className, expandedIndex, setExpandedIndex } = props;

  return (
    <TableCell component="div" className={className} variant="body">
      {props.rowIndex !== expandedIndex ? (
        <IconButton
          aria-label="Show details"
          onClick={() => setExpandedIndex(props.rowIndex)}
          size="small"
        >
          <ExpandMore />
        </IconButton>
      ) : (
        <IconButton
          aria-label="Hide details"
          onClick={() => setExpandedIndex(-1)}
          size="small"
        >
          <ExpandLess />
        </IconButton>
      )}
    </TableCell>
  );
};

export default ExpandCell;
