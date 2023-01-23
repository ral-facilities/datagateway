import React from 'react';
import {
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  type DatasearchType,
  type FiltersType,
  SearchFilter,
  SearchResponse,
  useLuceneFacet,
} from 'datagateway-common';
import {
  PARAMETER_VALUE_TYPE,
  ParameterValueType,
} from './parameterFilterTypes';
import { ParameterNumericRange } from './parameterNumericRange.component';
import { ParameterFacetList } from './parameterFacetList.component';

interface NewParameterFilterCreatorProps {
  allIds: number[];
  entityName: DatasearchType;
  parameterNames: string[];
}

interface ParameterValueFacet {
  label: string;
  count: number;
  from?: number;
  to?: number;
}

/**
 * Allows the user to construct a new parameter filter.
 * The creator first shows 2 dropdowns, one for selecting parameter to be filtered by, and the other one for selecting the type of the filter value.
 * Based on the type of the filter value, the creator shows different options that the user can filter the parameter with.
 * For example, if the user selects "number" for the type of the filter value, the creator will let the user specify the range of the filter value.
 * The resulting filter selects only the parameters whose values are within the number range.
 */
function NewParameterFilterCreator({
  allIds,
  entityName,
  parameterNames,
}: NewParameterFilterCreatorProps): JSX.Element {
  const [t] = useTranslation();

  const [parameterName, setParameterName] = React.useState('');
  const [valueType, setValueType] = React.useState<ParameterValueType | ''>('');
  // the search filter object being built by this creator,
  // which varies depending on the parameter name, type, and parameter value that the user chooses.
  const [, setFilterValue] = React.useState<SearchFilter | null>(null);

  const facetRequests = React.useMemo(() => {
    switch (valueType) {
      case PARAMETER_VALUE_TYPE.dateTime:
        const currentYear = new Date().getFullYear();
        const ranges = [
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
        ];

        return [
          {
            target: `${entityName}Parameter`,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            dimensions: [{ dimension: 'dateTimeValue', ranges }],
          },
        ];

      case PARAMETER_VALUE_TYPE.string:
        return [
          {
            target: `${entityName}Parameter`,
            dimensions: [{ dimension: 'stringValue' }],
          },
        ];

      default:
        return [];
    }
  }, [entityName, valueType]);

  const { data: parameterFacets, isLoading: isLoadingFilterValues } =
    useLuceneFacet(
      entityName,
      facetRequests,
      {
        [`${entityName.toLowerCase()}.id`]: allIds,
        'type.name': parameterName,
      } as FiltersType,
      {
        // only fetch facets on the parameter when parameter name is filled & when facet requests are constructed.
        enabled: facetRequests.length > 0 && Boolean(parameterName),
        select: React.useCallback(
          (data: SearchResponse): ParameterValueFacet[] => {
            if (!data.dimensions) return [];

            return Object.values(data.dimensions).flatMap((labelValues) =>
              Object.entries(labelValues).map(([label, value]) =>
                typeof value === 'number'
                  ? { label, count: value }
                  : {
                      label,
                      count: value.count,
                      from: value.from,
                      to: value.to,
                    }
              )
            );
          },
          []
        ),
      }
    );

  function changeParameterName(selectedName: string): void {
    setParameterName(selectedName);
  }

  function changeValueType(selectedValue: string): void {
    if (selectedValue in PARAMETER_VALUE_TYPE || selectedValue === '') {
      // at the moment the typescript type checker doesn't perform type narrowing
      // in control flows for arbitrary expressions like variables
      // therefore a cast has to be performed here to tell the type checker that this is valid
      // see:
      // https://github.com/microsoft/TypeScript/issues/10530
      // https://stackoverflow.com/questions/64616994/typescript-type-narrowing-not-working-for-in-when-key-is-stored-in-a-variable
      setValueType(selectedValue as ParameterValueType | '');
    }
  }

  /**
   * Constructs the search filter object based on the given parameter value facet.
   */
  function buildSearchFilterFromFacet(facet: ParameterValueFacet): void {
    switch (valueType) {
      case 'dateTime':
        setFilterValue({
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
        break;

      case 'string':
        setFilterValue({
          key: `${entityName.toLowerCase()}parameter.stringValue.${parameterName}`,
          label: facet.label,
          filter: [
            { field: 'stringValue', value: facet.label },
            { field: 'type.name', value: parameterName },
          ],
        });
        break;

      default:
        break;
    }
  }

  function buildSearchFilterFromNumericRange(
    min: number,
    max: number,
    unit: string
  ): void {
    const label =
      unit === '' ? `${min} to ${max}` : `${min} to ${max} (${unit})`;
    const filter =
      unit === ''
        ? {
            field: 'numericValue',
            from: min,
            to: max,
            key: label,
          }
        : {
            field: 'numericValue',
            from: min,
            to: max,
            key: label,
            units: unit,
          };

    setFilterValue({
      label,
      key: `${entityName.toLowerCase()}parameter.numericValue.${parameterName}`,
      filter: [filter, { field: 'type.name', value: parameterName }],
    });
  }

  function renderValueSelector(): JSX.Element {
    if (!parameterName || !valueType) {
      // cannot render value selector because users haven't selected all the required options

      let helpMessage = '';
      if (!parameterName && !valueType) {
        // both parameter name and parameter type are not selected
        helpMessage = t(
          'parameterFilters.creator.message.parameterNameAndTypeNotSelected'
        );
      } else if (!parameterName) {
        // parameter type selected but parameter name is not selected
        helpMessage = t(
          'parameterFilters.creator.message.parameterNameNotSelected'
        );
      } else if (!valueType) {
        // parameter name selected but parameter type is not selected
        helpMessage = t(
          'parameterFilters.creator.message.parameterTypeNotSelected'
        );
      }

      return <Typography variant="body2">{helpMessage}</Typography>;
    }

    switch (valueType) {
      case 'numeric':
        return (
          <ParameterNumericRange
            entityName={entityName}
            parameterTypeName={parameterName}
            onApplyRange={buildSearchFilterFromNumericRange}
            changeFilter={() => {
              // TODO
            }}
            setFilterUpdate={() => {
              // TODO
            }}
          />
        );

      case 'dateTime':
      case 'string':
        return parameterFacets ? (
          <ParameterFacetList
            entityName={entityName}
            parameterTypeName={parameterName}
            facets={parameterFacets}
            onSelectFacet={buildSearchFilterFromFacet}
            valueType={valueType}
            changeFilter={() => {
              // TODO
            }}
            setFilterUpdate={() => {
              // TODO
            }}
          />
        ) : (
          <></>
        );

      default:
        return <></>;
    }
  }

  return (
    <Stack sx={{ width: 300, p: 2 }} gap={2}>
      <Typography variant="subtitle1">
        {t('parameterFilters.creator.title')}
      </Typography>
      <Stack gap={1}>
        <TextField
          select
          size="small"
          id="parameter-name-select"
          value={parameterName}
          onChange={(e) => changeParameterName(e.target.value)}
          label={t('parameterFilters.creator.labels.parameterNameSelect')}
        >
          {parameterNames.map((param) => (
            <MenuItem key={param} value={param}>
              {param}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          id="parameter-value-type-select"
          label="Type"
          value={valueType}
          onChange={(e) => changeValueType(e.target.value)}
          sx={{ mt: 0.5 }}
        >
          {Object.values(PARAMETER_VALUE_TYPE).map((value) => (
            <MenuItem key={value} value={value}>
              {t(`parameterFilters.valueType.${value}`)}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      {isLoadingFilterValues ? (
        <Stack direction="row" alignItems="center" gap={1}>
          <CircularProgress size={24} />
          <Typography color="text.secondary">Loading...</Typography>
        </Stack>
      ) : (
        renderValueSelector()
      )}
    </Stack>
  );
}

export default NewParameterFilterCreator;
export type { ParameterValueFacet };
