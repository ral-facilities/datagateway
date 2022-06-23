import React from 'react';
import { TableHeaderProps } from 'react-virtualized';
import { TableCell, Checkbox } from '@material-ui/core';
import {
  CheckBoxOutlineBlank,
  CheckBox as CheckBoxIcon,
  IndeterminateCheckBox,
} from '@material-ui/icons';
import { StyledTooltip } from '../../arrowtooltip.component';

type SelectHeaderProps = TableHeaderProps & {
  className: string;
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
      className,
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
        className={className}
        variant="head"
      >
        <StyledTooltip
          title={
            !loading && typeof selectedRows === 'undefined'
              ? 'Selection information failed to load, please reload the page or try again later'
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
              style={{ height: 20, padding: 'inherit' }}
            />
          </span>
        </StyledTooltip>
      </TableCell>
    );
  }
);
SelectHeader.displayName = 'SelectHeader';

export default SelectHeader;
