import React from 'react';
import { TableHeaderProps } from 'react-virtualized';
import { TableCell, Checkbox, SxProps } from '@mui/material';
import {
  CheckBoxOutlineBlank,
  CheckBox as CheckBoxIcon,
  IndeterminateCheckBox,
} from '@mui/icons-material';

type SelectHeaderProps = TableHeaderProps & {
  sx: SxProps;
  loading: boolean;
  selectedRows: number[];
  totalRowCount: number;
  onCheck: (selectedIds: number[]) => void;
  onUncheck: (selectedIds: number[]) => void;
  allIds: number[];
};

const SelectHeader = React.memo(
  (props: SelectHeaderProps): React.ReactElement => {
    const {
      sx,
      selectedRows,
      totalRowCount,
      onCheck,
      onUncheck,
      allIds,
      loading,
    } = props;

    return (
      <TableCell
        size="small"
        padding="checkbox"
        component="div"
        sx={sx}
        variant="head"
      >
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
            if (allIds.every((x) => selectedRows.includes(x))) {
              onUncheck(allIds);
            } else {
              onCheck(allIds);
            }
          }}
          sx={{ height: '20px', margin: 'auto' }}
        />
      </TableCell>
    );
  }
);
SelectHeader.displayName = 'SelectHeader';

export default SelectHeader;
