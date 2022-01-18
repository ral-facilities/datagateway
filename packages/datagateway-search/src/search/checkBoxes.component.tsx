import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
import { connect } from 'react-redux';
import { StateType } from '../state/app.types';
import { useTranslation } from 'react-i18next';
import { parseSearchToQuery, usePushSearchToggles } from 'datagateway-common';
import { useLocation } from 'react-router-dom';
import { InputLabel, ListItemText, MenuItem, Select } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
      maxWidth: 300,
    },
    formLabel: {
      margin: 'auto',
      marginRight: theme.spacing(2),
    },
    select: {
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
      width: 250,
    },
  },
};

interface CheckBoxStoreProps {
  sideLayout: boolean;
  searchableEntities: string[];
}

interface SearchToggle {
  name: string;
  value: boolean;
  label: string;
  ariaLabel: string;
}

const CheckboxesGroup = (props: CheckBoxStoreProps): React.ReactElement => {
  const classes = useStyles();
  const [t] = useTranslation();
  const { searchableEntities } = props;

  const investigationSearchable = searchableEntities.includes('investigation');
  const datasetSearchable = searchableEntities.includes('dataset');
  const datafileSearchable = searchableEntities.includes('datafile');

  const location = useLocation();
  const { dataset, datafile, investigation } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
  const pushSearchToggles = usePushSearchToggles();

  const searchToggles: SearchToggle[] = [];

  if (investigationSearchable)
    searchToggles.push({
      name: 'Investigation',
      value: investigation,
      label: t('searchBox.checkboxes.investigation'),
      ariaLabel: t('searchBox.checkboxes.investigation_arialabel'),
    });
  if (datasetSearchable)
    searchToggles.push({
      name: 'Dataset',
      value: dataset,
      label: t('searchBox.checkboxes.dataset'),
      ariaLabel: t('searchBox.checkboxes.dataset_arialabel'),
    });
  if (datafileSearchable)
    searchToggles.push({
      name: 'Datafile',
      value: datafile,
      label: t('searchBox.checkboxes.datafile'),
      ariaLabel: t('searchBox.checkboxes.datafile_arialabel'),
    });

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>): void => {
    const newValues = event.target.value as string[];

    pushSearchToggles(
      newValues.indexOf('Dataset') > -1,
      newValues.indexOf('Datafile') > -1,
      newValues.indexOf('Investigation') > -1
    );
  };

  const error = searchToggles.filter((toggle) => toggle.value).length === 0;

  return (
    <div className={classes.root}>
      <FormControl
        required
        error={error}
        className={`${classes.formControl} tour-search-checkbox`}
      >
        {error && (
          <InputLabel
            id="search-entities-checkbox-label"
            variant="outlined"
            shrink={false}
          >
            Types
          </InputLabel>
        )}
        <Select
          labelId="search-entities-checkbox-label"
          id="search-entities-checkbox"
          className={classes.select}
          multiple
          value={searchToggles
            .filter((toggle) => toggle.value)
            .map((toggle) => toggle.name)}
          onChange={handleChange}
          variant="outlined"
          renderValue={(selected) => {
            return `Types (${(selected as string[]).length})`;
          }}
          MenuProps={MenuProps}
        >
          {searchToggles.map((toggle) => (
            <MenuItem key={toggle.name} value={toggle.name}>
              <Checkbox
                checked={toggle.value}
                inputProps={{ 'aria-label': toggle.ariaLabel }}
              />
              <ListItemText primary={toggle.name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

const mapStateToProps = (state: StateType): CheckBoxStoreProps => {
  return {
    sideLayout: state.dgsearch.sideLayout,
    searchableEntities: state.dgsearch.searchableEntities,
  };
};

export default connect(mapStateToProps)(CheckboxesGroup);
