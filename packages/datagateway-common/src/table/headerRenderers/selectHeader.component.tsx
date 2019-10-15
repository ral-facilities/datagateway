import React from 'react';
import { Entity } from '../../app.types';
import { TableHeaderProps } from 'react-virtualized';
import { TableCell, Checkbox } from '@material-ui/core';
import {
  CheckBoxOutlineBlank,
  CheckBox as CheckBoxIcon,
  IndeterminateCheckBox,
} from '@material-ui/icons';

type SelectHeaderProps = TableHeaderProps & {
  className: string;
  selectedRows: number[];
  data: Entity[];
  onCheck: (selectedIds: number[]) => void;
  onUncheck: (selectedIds: number[]) => void;
};

const SelectHeader = (props: SelectHeaderProps): React.ReactElement => {
  const { className, selectedRows, data, onCheck, onUncheck } = props;

  return (
    <TableCell component="div" className={className} variant="head">
      <Checkbox
        indeterminate={
          selectedRows.length > 0 && selectedRows.length < data.length
        }
        icon={<CheckBoxOutlineBlank fontSize="small" />}
        checkedIcon={<CheckBoxIcon fontSize="small" />}
        indeterminateIcon={<IndeterminateCheckBox fontSize="small" />}
        size="small"
        checked={selectedRows.length === data.length}
        inputProps={{ 'aria-label': 'select all rows' }}
        onClick={() => {
          const allIds = data.map(d => d.ID);
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
