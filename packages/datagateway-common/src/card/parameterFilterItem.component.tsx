import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  createStyles,
  Theme,
  ListItem,
  MenuItem,
  Select,
  Paper,
  FormControl,
  InputLabel,
} from '@material-ui/core';
import TitleIcon from '@material-ui/icons/Title';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import LooksOneIcon from '@material-ui/icons/LooksOne';
import { useTranslation } from 'react-i18next';
import { ParameterFacetList } from './parameterFacetList';
import { ParameterNumericRange } from './parameterNumericRange.component';
import { DatasearchType, FacetRequest, useLuceneFacet } from '../api';
import { FiltersType, SearchFilter } from '../app.types';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 144,
    },
    select: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      color: (theme as any).colours?.contrastGrey,
    },
    formControlIcon: {
      margin: theme.spacing(1),
      minWidth: 96,
    },
    selectIcon: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      color: (theme as any).colours?.contrastGrey,
    },
  })
);

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

export interface ParameterValueFacet {
  label: string;
  count: number;
  from?: number;
  to?: number;
}

type ValueType = 'DATE_AND_TIME' | 'NUMERIC' | 'STRING';

export interface ParameterValueFilter {
  name: string | undefined;
  valueType: ValueType | undefined;
}

interface ParameterFilterItemProps {
  entityName: DatasearchType;
  parameterNames: string[];
  filter: ParameterValueFilter;
  allIds: number[];
  changeFilter: (key: string, value: SearchFilter, remove?: boolean) => void;
  setFilterUpdate: React.Dispatch<React.SetStateAction<boolean>>;
}

const ParameterFilterItem = (
  props: ParameterFilterItemProps
): React.ReactElement => {
  const [t] = useTranslation();
  const classes = useStyles();
  const {
    entityName,
    parameterNames,
    filter,
    allIds,
    changeFilter,
    setFilterUpdate,
  } = props;

  const [filters, setFilters] = React.useState<FiltersType>({});
  const [facetRequests, setFacetRequests] = React.useState<FacetRequest[]>([]);
  const [facets, setFacets] = React.useState<ParameterValueFacet[]>([]);

  const onNameChange = (event: React.ChangeEvent<{ value: unknown }>): void => {
    const newName = event.target.value as string;
    filter.name = newName;
    setFilters({
      [`${entityName.toLowerCase()}.id`]: allIds,
      'type.name': newName,
    } as FiltersType);
  };

  const onValueTypeChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ): void => {
    const newType = event.target.value as ValueType;
    filter.valueType = newType;
    switch (newType) {
      case 'DATE_AND_TIME':
        const currentYear = new Date().getFullYear();
        const ranges = [
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
        setFacetRequests([
          {
            target: `${entityName}Parameter`,
            dimensions: [{ dimension: 'dateTimeValue', ranges: ranges }],
          },
        ]);
        break;
      case 'STRING':
        setFacetRequests([
          {
            target: `${entityName}Parameter`,
            dimensions: [{ dimension: 'stringValue' }],
          },
        ]);
        break;
      default:
        setFacetRequests([]);
    }
  };

  const { data, refetch } = useLuceneFacet(entityName, facetRequests, filters);

  React.useEffect(() => {
    if (facetRequests.length > 0 && Object.keys(filters).length > 0) {
      refetch();
    }
  }, [filters, facetRequests, refetch]);

  React.useEffect(() => {
    const valueFacets: ParameterValueFacet[] = [];
    if (data?.dimensions !== undefined) {
      Object.values(data.dimensions).forEach((labelValues) => {
        Object.entries(labelValues).forEach((labelValue) => {
          const value = labelValue[1];
          const facet =
            typeof value === 'number'
              ? { label: labelValue[0], count: value }
              : {
                  label: labelValue[0],
                  count: value.count,
                  from: value.from,
                  to: value.to,
                };
          valueFacets.push(facet);
        });
      });
    }
    setFacets(valueFacets);
  }, [data, setFacets]);

  return (
    <ListItem
      style={{ paddingLeft: '0px', paddingRight: '0px', width: '100%' }}
    >
      <Paper style={{ width: '100%' }}>
        <Grid container direction="row" justify="center" alignItems="center">
          <Grid item xs="auto" style={{ flexGrow: 1 }}>
            <FormControl className={classes.formControl}>
              <InputLabel variant="outlined">
                {t('filter.parameter.name')}
              </InputLabel>
              <Select
                label={t('filter.parameter.name')}
                className={classes.select}
                value={filter.name}
                onChange={onNameChange}
                variant="outlined"
                MenuProps={MenuProps}
              >
                {parameterNames.map((parameterName) => (
                  <MenuItem key={parameterName} value={parameterName}>
                    {parameterName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <FormControl className={classes.formControlIcon}>
              <InputLabel variant="outlined">
                {t('filter.parameter.value_type')}
              </InputLabel>
              <Select
                label={t('filter.parameter.value_type')}
                className={classes.selectIcon}
                value={filter.valueType}
                onChange={onValueTypeChange}
                variant="outlined"
                MenuProps={MenuProps}
              >
                <MenuItem key="DATE_AND_TIME" value="DATE_AND_TIME">
                  <CalendarTodayIcon />
                </MenuItem>
                <MenuItem key="NUMERIC" value="NUMERIC">
                  <LooksOneIcon />
                </MenuItem>
                <MenuItem key="STRING" value="STRING">
                  <TitleIcon />
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        {(filter.valueType === 'DATE_AND_TIME' ||
          filter.valueType === 'STRING') &&
        filter.name &&
        facets ? (
          <ParameterFacetList
            entityName={entityName}
            parameterTypeName={filter.name}
            facets={facets}
            changeFilter={changeFilter}
            setFilterUpdate={setFilterUpdate}
            valueType={filter.valueType}
          />
        ) : (
          filter.valueType === 'NUMERIC' &&
          filter.name && (
            <ParameterNumericRange
              entityName={entityName}
              parameterTypeName={filter.name}
              changeFilter={changeFilter}
              setFilterUpdate={setFilterUpdate}
            />
          )
        )}
      </Paper>
    </ListItem>
  );
};

export default ParameterFilterItem;
