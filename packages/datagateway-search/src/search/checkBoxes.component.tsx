import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { connect } from 'react-redux';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../state/app.types';
import {
  toggleDataset,
  toggleDatafile,
  toggleInvestigation,
} from '../state/actions/actions';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    formControl: {
      margin: theme.spacing(2),
    },
  })
);

interface CheckBoxStoreProps {
  dataset: boolean;
  datafile: boolean;
  investigation: boolean;
}

interface CheckBoxDispatchProps {
  toggleDataset: (toggleOption: boolean) => Action;
  toggleDatafile: (toggleOption: boolean) => Action;
  toggleInvestigation: (toggleOption: boolean) => Action;
}

type CheckBoxCombinedProps = CheckBoxStoreProps & CheckBoxDispatchProps;

const CheckboxesGroup = (props: CheckBoxCombinedProps): React.ReactElement => {
  const classes = useStyles();
  const {
    dataset,
    datafile,
    investigation,
    toggleDataset,
    toggleDatafile,
    toggleInvestigation,
  } = props;

  const handleChange = (name: string, checked: boolean) => (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const toggleOption = !checked;
    if (name === 'Investigation') {
      toggleInvestigation(toggleOption);
    } else if (name === 'Datafile') {
      toggleDatafile(toggleOption);
    } else if (name === 'Dataset') {
      toggleDataset(toggleOption);
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
        className={classes.formControl}
      >
        <FormLabel component="legend">
          {t('searchBox.checkboxes.text')}
        </FormLabel>
        <FormGroup>
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

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): CheckBoxDispatchProps => ({
  toggleDataset: (toggleOption: boolean) =>
    dispatch(toggleDataset(toggleOption)),
  toggleDatafile: (toggleOption: boolean) =>
    dispatch(toggleDatafile(toggleOption)),
  toggleInvestigation: (toggleOption: boolean) =>
    dispatch(toggleInvestigation(toggleOption)),
});

const mapStateToProps = (state: StateType): CheckBoxStoreProps => {
  return {
    dataset: state.dgsearch.checkBox.dataset,
    datafile: state.dgsearch.checkBox.datafile,
    investigation: state.dgsearch.checkBox.investigation,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CheckboxesGroup);
