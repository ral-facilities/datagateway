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

function ParameterDateTimeSelector({
  entityName,
  parameterName,
  allIds,
  onNewFilter,
}: ParameterValueSelectorProps): JSX.Element {
  const [t] = useTranslation();

  const facetRequests: FacetRequest[] = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      {
        target: `${entityName}Parameter`,
        dimensions: [
          {
            dimension: 'dateTimeValue',
            ranges: [
              {
                key: '2023',
                from: 1672531200000,
                to: Date.now(),
              },
              {
                key: `${currentYear}`,
                from: new Date(currentYear, 0).getTime(),
                to: Date.now(),
              },
              {
                key: `${currentYear - 1}`,
                from: new Date(currentYear - 1, 0).getTime(),
                to: new Date(currentYear, 0).getTime(),
              },
              {
                key: `${currentYear - 2}`,
                from: new Date(currentYear - 2, 0).getTime(),
                to: new Date(currentYear - 1, 0).getTime(),
              },
              {
                key: `${currentYear - 3}`,
                from: new Date(currentYear - 3, 0).getTime(),
                to: new Date(currentYear - 2, 0).getTime(),
              },
              {
                key: 'Older',
                to: new Date(currentYear - 3, 0).getTime(),
              },
            ],
          },
        ],
      },
    ];
  }, [entityName]);

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
      key: `${entityName.toLowerCase()}parameter.dateTimeValue.${parameterName}`,
      label: facet.label,
      filter: [
        {
          from: facet.from,
          to: facet.to,
          key: facet.label,
          field: 'dateTimeValue',
        },
        {
          field: 'type.name',
          value: parameterName,
        },
      ],
    });
  }

  if (isLoadingFacets) {
    return (
      <Stack direction="row" alignItems="center" gap={1}>
        <CircularProgress size={24} />
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
        label={t('parameterFilters.creator.labels.parameterDateTimeSelect')}
        data-testid="parameter-date-time-selector"
        value={selectedFacet?.label ?? null}
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

export default ParameterDateTimeSelector;
