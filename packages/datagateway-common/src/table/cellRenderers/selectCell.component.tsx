import React from 'react';
import { TableCellProps } from 'react-virtualized';
import { TableCell, Checkbox } from '@material-ui/core';
import {
  CheckBoxOutlineBlank,
  CheckBox as CheckBoxIcon,
} from '@material-ui/icons';
import { Entity } from '../../app.types';

type SelectCellProps = TableCellProps & {
  selectedRows: number[];
  data: Entity[];
  className: string;
  onCheck: (selectedIndexes: number[]) => void;
  onUncheck: (selectedIndexes: number[]) => void;
  lastChecked: number;
  setLastChecked: (newLastChecked: number) => void;
  loading: boolean;
};

const SelectCell = (props: SelectCellProps): React.ReactElement => {
  const {
    className,
    selectedRows,
    data,
    onCheck,
    onUncheck,
    lastChecked,
    setLastChecked,
    rowData,
    rowIndex,
    loading,
  } = props;

  return (
    <TableCell
      size="small"
      padding="checkbox"
      component="div"
      className={className}
      variant="body"
    >
      <Checkbox
        checked={selectedRows.includes(rowData.ID)}
        inputProps={{
          'aria-label': `select row ${rowIndex}`,
        }}
        disabled={loading}
        icon={<CheckBoxOutlineBlank fontSize="small" />}
        checkedIcon={<CheckBoxIcon fontSize="small" />}
        size="small"
        onClick={event => {
          if (event.shiftKey) {
            const shiftClickedRows = Array(Math.abs(rowIndex - lastChecked) + 1)
              .fill(Math.min(rowIndex, lastChecked))
              .map((value, index) => data[value + index].ID);

            if (selectedRows.includes(rowData.ID)) {
              onUncheck(shiftClickedRows);
            } else {
              onCheck(shiftClickedRows);
            }
          } else {
            const id = rowData.ID;
            if (selectedRows.includes(id)) {
              onUncheck([id]);
            } else {
              onCheck([id]);
            }
          }
          setLastChecked(rowIndex);
        }}
      />
    </TableCell>
  );
};

export default SelectCell;
