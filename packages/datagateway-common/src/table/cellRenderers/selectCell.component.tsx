import React from 'react';
import { TableCellProps } from 'react-virtualized';
import { TableCell, Checkbox, SxProps } from '@mui/material';
import {
  CheckBoxOutlineBlank,
  CheckBox as CheckBoxIcon,
} from '@mui/icons-material';
import { Entity, ICATEntity } from '../../app.types';
import { useTranslation } from 'react-i18next';
import { StyledTooltip } from '../../arrowtooltip.component';

type SelectCellProps = TableCellProps & {
  selectedRows: number[] | undefined;
  data: Entity[];
  sx: SxProps;
  onCheck: (selectedIndexes: number[]) => void;
  onUncheck: (selectedIndexes: number[]) => void;
  lastChecked: number;
  setLastChecked: (newLastChecked: number) => void;
  loading: boolean;
};

const SelectCell = React.memo((props: SelectCellProps): React.ReactElement => {
  const {
    sx,
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
  const { t } = useTranslation();

  return (
    <TableCell
      size="small"
      padding="checkbox"
      component="div"
      sx={sx}
      variant="body"
    >
      <StyledTooltip
        title={
          !loading && typeof selectedRows === 'undefined'
            ? t<string, string>('buttons.cart_loading_failed_tooltip')
            : loading
            ? t<string, string>('buttons.cart_loading_tooltip')
            : ''
        }
        placement="right"
      >
        <span>
          <Checkbox
            className="tour-dataview-add-to-cart"
            // have to inherit as the padding="checkbox" is on the span
            style={{ padding: 'inherit' }}
            checked={selectedRows?.includes(rowData.id)}
            inputProps={{
              'aria-label': `select row ${rowIndex}`,
            }}
            disabled={loading || typeof selectedRows === 'undefined'}
            icon={<CheckBoxOutlineBlank fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            size="small"
            onClick={(event) => {
              if (event.shiftKey) {
                const shiftClickedRows = Array(
                  Math.abs(rowIndex - lastChecked) + 1
                )
                  .fill(Math.min(rowIndex, lastChecked))
                  .map((value, index) => {
                    const icatEntity = data[value + index] as ICATEntity;
                    return icatEntity.id;
                  });

                if (selectedRows?.includes(rowData.id)) {
                  onUncheck(shiftClickedRows);
                } else {
                  onCheck(shiftClickedRows);
                }
              } else {
                // The id that comes from Lucene is a string
                let id = rowData.id;
                if (typeof id !== 'number') id = Number(id);
                if (selectedRows?.includes(id)) {
                  onUncheck([id]);
                } else {
                  onCheck([id]);
                }
              }
              setLastChecked(rowIndex);
            }}
          />
        </span>
      </StyledTooltip>
    </TableCell>
  );
});
SelectCell.displayName = 'SelectCell';

export default SelectCell;
