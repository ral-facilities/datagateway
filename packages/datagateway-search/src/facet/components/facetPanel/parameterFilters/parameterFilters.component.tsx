import React from 'react';
import {
  Box,
  IconButton,
  List,
  Popover,
  Stack,
  Typography,
} from '@mui/material';
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
  onAddParameterFilter: (filterKey: string, filterValue: SearchFilter) => void;
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
  onAddParameterFilter,
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

  function addNewParameterFilter(
    filterKey: string,
    filterValue: SearchFilter
  ): void {
    onAddParameterFilter(filterKey, filterValue);
    closeNewParameterFilterCreator();
  }

  const selectedParameterFilters = selectedFilters.filter(
    (filter): filter is NestedFilter =>
      typeof filter !== 'string' && 'filter' in filter
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      width="100%"
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ width: '100%' }}
      >
        <Typography variant="subtitle1">
          {t('parameterFilters.title')}
        </Typography>
        <IconButton
          aria-label={t('parameterFilters.addFilter')}
          size="small"
          onClick={openNewParameterFilterCreator}
        >
          <Add />
        </IconButton>
      </Stack>
      {selectedParameterFilters.length > 0 ? (
        <List
          dense
          disablePadding
          aria-label={t('parameterFilters.selectedParameterFilterList')}
          sx={{ width: '100%' }}
        >
          {selectedParameterFilters.map((filter, index) => (
            <ParameterFilterItem
              filter={filter}
              key={`${filter.key}:${filter.label}`}
            />
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {t('parameterFilters.noFilters')}
        </Typography>
      )}
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
          onAddFilter={addNewParameterFilter}
          onClose={closeNewParameterFilterCreator}
        />
      </Popover>
    </Box>
  );
};

ParameterFilters.whyDidYouRender = true;

export default ParameterFilters;
