import React from 'react';
import { TableHeaderProps } from 'react-virtualized';
import { TableCell, Checkbox, SxProps } from '@mui/material';
import {
  CheckBoxOutlineBlank,
  CheckBox as CheckBoxIcon,
  IndeterminateCheckBox,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { StyledTooltip } from '../../arrowtooltip.component';

type SelectHeaderProps = TableHeaderProps & {
  sx: SxProps;
  loading: boolean;
  selectedRows: number[] | undefined;
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
    const { t } = useTranslation();

    return (
      <TableCell
        size="small"
        padding="checkbox"
        component="div"
        sx={sx}
        variant="head"
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
          <span style={{ margin: 'auto' }}>
            <Checkbox
              indeterminate={
                selectedRows &&
                selectedRows.length > 0 &&
                selectedRows.length < totalRowCount
              }
              disabled={loading || typeof selectedRows === 'undefined'}
              icon={<CheckBoxOutlineBlank fontSize="small" />}
              checkedIcon={<CheckBoxIcon fontSize="small" />}
              indeterminateIcon={<IndeterminateCheckBox fontSize="small" />}
              size="small"
              checked={
                totalRowCount !== 0 && selectedRows?.length === totalRowCount
              }
              inputProps={{ 'aria-label': 'select all rows' }}
              onClick={() => {
                if (allIds.every((x) => selectedRows?.includes(x))) {
                  onUncheck(allIds);
                } else {
                  onCheck(allIds);
                }
              }}
              // have to inherit as the padding="checkbox" is on the span
              sx={{ height: 20, padding: 'inherit' }}
            />
          </span>
        </StyledTooltip>
      </TableCell>
    );
  }
);
SelectHeader.displayName = 'SelectHeader';

export default SelectHeader;
