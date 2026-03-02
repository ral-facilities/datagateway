import {
  CircularProgress,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  useLuceneFacet,
  type FacetRequest,
  type FiltersType,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExtraSmallChip } from '../../toggleableFilterItem.component';
import parameterFacetsFromSearchResponse from '../parameterFacetsFromSearchResponse';
import type { ParameterValueFacet } from '../parameterFilterTypes';
import ParameterValueSelectorProps from './parameterValueSelectorProps';

function ParameterDateTimeSelector({
  entityName,
  parameterName,
  allIds,
  onNewFilter,
}: ParameterValueSelectorProps): JSX.Element {
  const [t] = useTranslation();

  const [currentDate] = React.useState(() => new Date());

  const facetRequests: FacetRequest[] = React.useMemo(() => {
    const currentYear = currentDate.getFullYear();
    return [
      {
        target: `${entityName}Parameter`,
        dimensions: [
          {
            dimension: 'dateTimeValue',
            ranges: [
              {
                key: `${currentYear}`,
                from: new Date(currentYear, 0).getTime(),
                to: currentDate.getTime(),
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
  }, [currentDate, entityName]);

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
      key: `${entityName}Parameter.dateTimeValue.${parameterName}`,
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
        value={selectedFacet?.label ?? ''}
        color="secondary"
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
            <ExtraSmallChip label={facet.count} />
          </MenuItem>
        ))}
      </TextField>
    );
  }

  return <></>;
}

export default ParameterDateTimeSelector;
