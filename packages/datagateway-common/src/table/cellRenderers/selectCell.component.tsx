import React from 'react';
import { TableCellProps } from 'react-virtualized';
import { TableCell, Checkbox } from '@material-ui/core';
import {
  CheckBoxOutlineBlank,
  CheckBox as CheckBoxIcon,
} from '@material-ui/icons';
import { Entity, ICATEntity } from '../../app.types';

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
        checked={selectedRows.includes(rowData.id)}
        inputProps={{
          'aria-label': `select row ${rowIndex}`,
        }}
        disabled={loading}
        icon={<CheckBoxOutlineBlank fontSize="small" />}
        checkedIcon={<CheckBoxIcon fontSize="small" />}
        size="small"
        onClick={(event) => {
          if (event.shiftKey) {
            const shiftClickedRows = Array(Math.abs(rowIndex - lastChecked) + 1)
              .fill(Math.min(rowIndex, lastChecked))
              .map((value, index) => {
                const icatEntity = data[value + index] as ICATEntity;
                return icatEntity.id;
              });

            if (selectedRows.includes(rowData.id)) {
              onUncheck(shiftClickedRows);
            } else {
              onCheck(shiftClickedRows);
            }
          } else {
            const id = rowData.id;
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
