import React from 'react';
import { NestedFilter } from 'datagateway-common';
import { IconButton, ListItem, ListItemText } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

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
  const [t] = useTranslation();
  const userLabel = `${filter.key.split('.').at(-1)}: ${filter.label}`;

  return (
    <ListItem
      dense
      disableGutters
      key={`${filter.key}:${filter.label}`}
      secondaryAction={
        <IconButton
          aria-label={t('parameterFilters.removeFilter', {
            filterLabel: userLabel,
          })}
          size="small"
          onClick={() => onRemove(filter)}
        >
          <Close fontSize="inherit" />
        </IconButton>
      }
    >
      <ListItemText primary={userLabel} />
    </ListItem>
  );
}

export default ParameterFilterItem;
