import React from 'react';
import {
  Theme,
  FormControl,
  Checkbox,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { connect } from 'react-redux';
import { StateType } from '../state/app.types';
import { useTranslation } from 'react-i18next';
import { parseSearchToQuery, usePushSearchToggles } from 'datagateway-common';
import { useLocation } from 'react-router-dom';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    sx: {
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

  const handleChange = (event: SelectChangeEvent<string[]>): void => {
    const newValues = event.target.value as string[];

    pushSearchToggles(
      newValues.indexOf('Dataset') > -1,
      newValues.indexOf('Datafile') > -1,
      newValues.indexOf('Investigation') > -1
    );
  };

  const error = searchToggles.filter((toggle) => toggle.value).length === 0;

  return (
    <div style={{ display: 'flex' }}>
      <FormControl
        required
        error={error}
        className="tour-search-checkbox"
        sx={{ margin: 1, minWidth: '120px', maxWidth: '300px' }}
        variant="standard"
      >
        {error && (
          <InputLabel
            id="search-entities-checkbox-label"
            variant="outlined"
            shrink={false}
          >
            {t('searchBox.checkboxes.types')}
          </InputLabel>
        )}
        <Select
          {...(error ? { labelId: 'search-entities-checkbox-label' } : {})}
          id="search-entities-menu"
          sx={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            color: (theme: Theme) => (theme as any).colours?.contrastGrey,
          }}
          multiple
          value={searchToggles
            .filter((toggle) => toggle.value)
            .map((toggle) => toggle.name)}
          onChange={handleChange}
          variant="outlined"
          renderValue={(selected) => {
            return `${t('searchBox.checkboxes.types')} (${
              (selected as string[]).length
            })`;
          }}
          MenuProps={MenuProps}
        >
          {searchToggles.map((toggle) => (
            <MenuItem key={toggle.name} value={toggle.name}>
              <Checkbox
                checked={toggle.value}
                inputProps={{ 'aria-label': toggle.ariaLabel }}
              />
              <ListItemText primary={toggle.label} />
            </MenuItem>
          ))}
        </Select>
        {error && (
          <FormHelperText sx={{ marginLeft: '14px', marginRight: '14px' }}>
            {t('searchBox.checkboxes.types_error')}
          </FormHelperText>
        )}
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
