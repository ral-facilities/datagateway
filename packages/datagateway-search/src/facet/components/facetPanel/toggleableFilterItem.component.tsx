import {
  Box,
  Checkbox,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import React from 'react';

interface ToggleableFilterItemProps {
  classificationLabel: string;
  count: number | undefined;
  selected: boolean;
  onSelect: (classificationLabel: string, selected: boolean) => void;
}

function ToggleableFilterItem({
  classificationLabel,
  count,
  selected,
  onSelect,
}: ToggleableFilterItemProps): JSX.Element {
  return (
    <ListItemButton
      dense
      disableGutters
      sx={{ px: 1.5 }}
      selected={selected}
      aria-label={`${
        selected ? 'Remove' : 'Add'
      } ${classificationLabel} filter`}
      aria-selected={selected}
      onClick={() => onSelect(classificationLabel, !selected)}
    >
      <ListItemIcon sx={{ minWidth: 'auto' }}>
        <Checkbox
          size="small"
          disableRipple
          sx={{ padding: 0, paddingRight: 1 }}
          checked={selected}
          inputProps={{
            'aria-label': `${
              selected ? 'Remove' : 'Add'
            } ${classificationLabel} filter`,
          }}
        />
      </ListItemIcon>
      <ListItemText>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          <Box flex={1} overflow="hidden" textOverflow="ellipsis">
            {classificationLabel}
          </Box>
          {count && <span>{count}</span>}
        </Box>
      </ListItemText>
    </ListItemButton>
  );
}

export default ToggleableFilterItem;
