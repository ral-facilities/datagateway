import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { connect } from 'react-redux';
import { StateType } from '../state/app.types';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    formControl: {
      marginLeft: theme.spacing(2),
    },
    formControlSide: {
      margin: theme.spacing(2),
    },
    formLabel: {
      margin: 'auto',
      marginRight: theme.spacing(2),
    },
  })
);

interface CheckBoxProps {
  dataset: boolean;
  datafile: boolean;
  investigation: boolean;
  onToggleDataset: (toggleOption: boolean) => void;
  onToggleDatafile: (toggleOption: boolean) => void;
  onToggleInvestigation: (toggleOption: boolean) => void;
}

interface CheckBoxStoreProps {
  sideLayout: boolean;
}

type CheckBoxCombinedProps = CheckBoxProps & CheckBoxStoreProps;

const CheckboxesGroup = (props: CheckBoxCombinedProps): React.ReactElement => {
  const classes = useStyles();
  const {
    dataset,
    datafile,
    investigation,
    sideLayout,
    onToggleDataset,
    onToggleDatafile,
    onToggleInvestigation,
  } = props;

  const handleChange = (name: string, checked: boolean) => (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const toggleOption = !checked;
    if (name === 'Investigation') {
      onToggleInvestigation(toggleOption);
    } else if (name === 'Datafile') {
      onToggleDatafile(toggleOption);
    } else if (name === 'Dataset') {
      onToggleDataset(toggleOption);
    }
  };

  const error = ![investigation, dataset, datafile].includes(true);

  const [t] = useTranslation();

  return (
    <div className={classes.root}>
      <FormControl
        required
        error={error}
        component="fieldset"
        className={`${
          sideLayout ? classes.formControlSide : classes.formControl
        } tour-search-checkbox`}
      >
        <FormGroup row={!sideLayout}>
          <FormLabel component="legend" className={classes.formLabel}>
            {t('searchBox.checkboxes.text')}
          </FormLabel>
          <FormControlLabel
            control={
              <Checkbox
                checked={investigation}
                onChange={handleChange('Investigation', investigation)}
                value="Investigation"
                inputProps={{
                  'aria-label': t(
                    'searchBox.checkboxes.investigation_arialabel'
                  ),
                }}
              />
            }
            label={t('searchBox.checkboxes.investigation')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={dataset}
                onChange={handleChange('Dataset', dataset)}
                value="Dataset"
                inputProps={{
                  'aria-label': t('searchBox.checkboxes.dataset_arialabel'),
                }}
              />
            }
            label={t('searchBox.checkboxes.dataset')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={datafile}
                onChange={handleChange('Datafile', datafile)}
                value="Datafile"
                inputProps={{
                  'aria-label': t('searchBox.checkboxes.datafile_arialabel'),
                }}
              />
            }
            label={t('searchBox.checkboxes.datafile')}
          />
        </FormGroup>
      </FormControl>
    </div>
  );
};

const mapStateToProps = (state: StateType): CheckBoxStoreProps => {
  return {
    sideLayout: state.dgsearch.sideLayout,
  };
};

export default connect(mapStateToProps)(CheckboxesGroup);
