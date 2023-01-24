import React from 'react';
import { NestedFilter } from 'datagateway-common';
import { IconButton, ListItem, ListItemText } from '@mui/material';
import { Close } from '@mui/icons-material';

interface ParameterFilterItemProps {
  filter: NestedFilter;
  onRemove: (removedFilter: NestedFilter) => void;
}

/**
 * Shows a parameter filter in a formatted user-friendly way.
 * @constructor
 */
function ParameterFilterItem({
  filter,
  onRemove,
}: ParameterFilterItemProps): JSX.Element {
  return (
    <ListItem
      dense
      disableGutters
      key={`${filter.key}:${filter.label}`}
      secondaryAction={
        <IconButton size="small" onClick={() => onRemove(filter)}>
          <Close fontSize="inherit" />
        </IconButton>
      }
    >
      <ListItemText
        primary={`${filter.key.split('.').at(-1)}: ${filter.label}`}
      />
    </ListItem>
  );
}

export default ParameterFilterItem;
