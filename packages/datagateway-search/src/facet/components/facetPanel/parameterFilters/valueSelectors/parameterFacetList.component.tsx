import React from 'react';
import {
  CircularProgress,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  type FacetRequest,
  type FiltersType,
  useLuceneFacet,
} from 'datagateway-common';
import type { ParameterValueFacet } from '../newParameterFilterCreator.component';
import parameterFacetsFromSearchResponse from '../parameterFacetsFromSearchResponse';
import ParameterValueSelectorProps from './parameterValueSelectorProps';
import { useTranslation } from 'react-i18next';

function ParameterFacetList({
  entityName,
  parameterName,
  allIds,
  onNewFilter,
}: ParameterValueSelectorProps): JSX.Element {
  const [t] = useTranslation();

  const facetRequests: FacetRequest[] = [
    {
      target: `${entityName}Parameter`,
      dimensions: [{ dimension: 'stringValue' }],
    },
  ];

  const { data: facets, isLoading: isLoadingFacets } = useLuceneFacet(
    entityName,
    facetRequests,
    {
      [`${entityName.toLowerCase()}.id`]: allIds,
      'type.name': parameterName,
    } as FiltersType,
    {
      select: parameterFacetsFromSearchResponse,
    }
  );

  const [selectedFacet, setSelectedFacet] =
    React.useState<ParameterValueFacet | null>(null);

  function selectFacet(facet: ParameterValueFacet): void {
    setSelectedFacet(facet);
    onNewFilter({
      key: `${entityName}Parameter.stringValue.${parameterName}`,
      label: facet.label,
      filter: [
        { field: 'stringValue', value: facet.label },
        { field: 'type.name', value: parameterName },
      ],
    });
  }

  if (isLoadingFacets) {
    return (
      <Stack direction="row" alignItems="center" gap={1}>
        <CircularProgress size={24} />`{' '}
        <Typography color="text.secondary">
          {t('parameterFilters.creator.loading')}
        </Typography>
      </Stack>
    );
  }

  if (facets) {
    return (
      <TextField
        select
        size="small"
        label={t('parameterFilters.creator.labels.parameterStringSelect')}
        data-testid="parameter-facet-list"
        value={selectedFacet?.label ?? ''}
      >
        {facets.map((facet, index) => (
          <MenuItem
            key={index}
            disabled={facet.count === 0}
            value={facet.label}
            onClick={() => selectFacet(facet)}
            aria-label={`Filter by ${facet.label}`}
          >
            <ListItemText>{facet.label}</ListItemText>
            <Typography variant="body2" color="text.secondary">
              {facet.count}
            </Typography>
          </MenuItem>
        ))}
      </TextField>
    );
  }

  return <></>;
}

export default ParameterFacetList;
