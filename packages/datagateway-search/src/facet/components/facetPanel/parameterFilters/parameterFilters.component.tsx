import React from 'react';
import { Box, Button, List, Popover } from '@mui/material';
import { Add } from '@mui/icons-material';
import type {
  DatasearchType,
  NestedFilter,
  SearchFilter,
} from 'datagateway-common';
import ParameterFilterItem from './parameterFilterItem.component';
import NewParameterFilterCreator from './newParameterFilterCreator.component';
import { useTranslation } from 'react-i18next';

interface ParameterFiltersProps {
  entityName: DatasearchType;
  parameterNames: string[];
  allIds: number[];
  selectedFilters: SearchFilter[];
  changeFilter: (key: string, value: SearchFilter, remove?: boolean) => void;
  setFilterUpdate: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * A UI component that allows users to filter search results based on the parameter value of each item.
 * For example, the user can filter investigations so that the value of a certain parameter of each investigation returned
 * matches the range specified by the applied parameter filter.
 */
const ParameterFilters = ({
  entityName,
  parameterNames,
  allIds,
  selectedFilters,
  changeFilter,
  setFilterUpdate,
}: ParameterFiltersProps): React.ReactElement => {
  const [t] = useTranslation();

  const [isNewFilterPopoverVisible, setIsNewFilterPopoverVisible] =
    React.useState(false);
  const [popoverAnchor, setPopoverAnchor] = React.useState<HTMLElement | null>(
    null
  );

  function openNewParameterFilterCreator(
    event: React.MouseEvent<HTMLElement>
  ): void {
    setIsNewFilterPopoverVisible(true);
    setPopoverAnchor(event.currentTarget);
  }

  function closeNewParameterFilterCreator(): void {
    setIsNewFilterPopoverVisible(false);
    setPopoverAnchor(null);
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
    >
      {selectedFilters.length > 0 && (
        <List
          dense
          disablePadding
          aria-label={t('parameterFilters.selectedParameterFilterList')}
          sx={{ width: '100%' }}
        >
          {selectedFilters
            .filter(
              (filter): filter is NestedFilter =>
                typeof filter !== 'string' && 'filter' in filter
            )
            .map((filter, index) => (
              <ParameterFilterItem
                filter={filter}
                key={`${filter.key}:${filter.label}`}
              />
            ))}
        </List>
      )}
      <Button
        disableElevation
        variant="outlined"
        size="small"
        startIcon={<Add />}
        sx={{ width: '100%', mt: 1 }}
        onClick={openNewParameterFilterCreator}
      >
        Filter Parameter Value
      </Button>
      <Popover
        open={isNewFilterPopoverVisible}
        anchorEl={popoverAnchor}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        onClose={closeNewParameterFilterCreator}
      >
        <NewParameterFilterCreator
          allIds={allIds}
          entityName={entityName}
          parameterNames={parameterNames}
        />
      </Popover>
    </Box>
  );
};

ParameterFilters.whyDidYouRender = true;

export default ParameterFilters;
