import React from 'react';
import { NestedFilter } from 'datagateway-common';
import { ListItem, ListItemText } from '@mui/material';

/**
 * Shows a parameter filter in a formatted user-friendly way.
 * @constructor
 */
function ParameterFilterItem({
  filter,
}: {
  filter: NestedFilter;
}): JSX.Element {
  return (
    <ListItem dense disableGutters key={`${filter.key}:${filter.label}`}>
      <ListItemText>
        {filter.key.split('.').at(-1)}: {filter.label}
      </ListItemText>
    </ListItem>
  );
}

export default ParameterFilterItem;
