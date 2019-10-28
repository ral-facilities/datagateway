import React from 'react';
import { TableHeaderProps } from 'react-virtualized';
import { TableCell, Checkbox } from '@material-ui/core';
import {
  CheckBoxOutlineBlank,
  CheckBox as CheckBoxIcon,
  IndeterminateCheckBox,
} from '@material-ui/icons';

type SelectHeaderProps = TableHeaderProps & {
  className: string;
  loading: boolean;
  selectedRows: number[];
  totalRowCount: number;
  onCheck: (selectedIds: number[]) => void;
  onUncheck: (selectedIds: number[]) => void;
  allIds: number[];
};

const SelectHeader = (props: SelectHeaderProps): React.ReactElement => {
  const {
    className,
    selectedRows,
    totalRowCount,
    onCheck,
    onUncheck,
    allIds,
    loading,
  } = props;

  return (
    <TableCell component="div" className={className} variant="head">
      <Checkbox
        indeterminate={
          selectedRows.length > 0 && selectedRows.length < totalRowCount
        }
        disabled={loading}
        icon={<CheckBoxOutlineBlank fontSize="small" />}
        checkedIcon={<CheckBoxIcon fontSize="small" />}
        indeterminateIcon={<IndeterminateCheckBox fontSize="small" />}
        size="small"
        checked={totalRowCount !== 0 && selectedRows.length === totalRowCount}
        inputProps={{ 'aria-label': 'select all rows' }}
        onClick={() => {
          if (allIds.every(x => selectedRows.includes(x))) {
            onUncheck(allIds);
          } else {
            onCheck(allIds);
          }
        }}
      />
    </TableCell>
  );
};

export default SelectHeader;
