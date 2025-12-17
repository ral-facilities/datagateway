import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import IndeterminateCheckBox from '@mui/icons-material/IndeterminateCheckBox';
import { Checkbox, SxProps, TableCell } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TableHeaderProps } from 'react-virtualized';
import { StyledTooltip } from '../../arrowtooltip.component';

type SelectHeaderProps = TableHeaderProps & {
  sx: SxProps;
  loading: boolean;
  parentSelected: boolean;
  selectedRows: number[] | undefined;
  totalRowCount: number;
  onCheck: (selectedIds: number[]) => void;
  onUncheck: (selectedIds: number[]) => void;
  allIds: number[];
  disableIfAnon?: boolean;
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
      parentSelected,
      disableIfAnon,
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
            disableIfAnon
              ? t('buttons.disallow_anon_tooltip')
              : !loading &&
                !parentSelected &&
                typeof selectedRows === 'undefined'
              ? t<string, string>('buttons.cart_loading_failed_tooltip')
              : loading
              ? t<string, string>('buttons.cart_loading_tooltip')
              : parentSelected
              ? t<string, string>('buttons.parent_selected_tooltip')
              : ''
          }
          placement="right"
        >
          <span style={{ margin: 'auto' }}>
            <Checkbox
              indeterminate={
                !parentSelected &&
                selectedRows &&
                selectedRows.length > 0 &&
                selectedRows.length < totalRowCount
              }
              disabled={
                disableIfAnon ||
                loading ||
                parentSelected ||
                typeof selectedRows === 'undefined'
              }
              icon={<CheckBoxOutlineBlank fontSize="small" />}
              checkedIcon={<CheckBoxIcon fontSize="small" />}
              indeterminateIcon={<IndeterminateCheckBox fontSize="small" />}
              size="small"
              checked={
                parentSelected ||
                (totalRowCount !== 0 && selectedRows?.length === totalRowCount)
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
