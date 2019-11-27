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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    formControl: {
      margin: theme.spacing(1),
    },
  })
);

interface CheckBoxStoreProps {
  dataset: boolean;
  datafile: boolean;
  investigation: boolean;
}

interface CheckBoxDispatchProps {
  toggleDataset: (toggleoption: boolean) => Action;
  toggleDatafile: (toggleoption: boolean) => Action;
  toggleInvestigation: (toggleoption: boolean) => Action;
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

  const handleChange = (name: string, checked: boolean): any => (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    let toggleoption = !checked;
    console.log(toggleoption);
    if (name === 'Investigation') {
      toggleInvestigation(toggleoption);
    } else if (name === 'Datafile') {
      toggleDatafile(toggleoption);
    } else if (name === 'Dataset') {
      toggleDataset(toggleoption);
    }

    console.log('box checked?');
    console.log(toggleoption);
  };

  const error = ![investigation, dataset, datafile].includes(true);

  return (
    <div className={classes.root}>
      <FormControl
        required
        error={error}
        component="fieldset"
        className={classes.formControl}
      >
        <FormLabel component="legend">Please select at least one</FormLabel>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={investigation}
                onChange={handleChange('Investigation', investigation)}
                value="Investigation"
              />
            }
            label="Investigation"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={dataset}
                onChange={handleChange('Dataset', dataset)}
                value="Dataset"
              />
            }
            label="Dataset"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={datafile}
                onChange={handleChange('Datafile', datafile)}
                value="Datafile"
              />
            }
            label="Datafile"
          />
        </FormGroup>
      </FormControl>
    </div>
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): CheckBoxDispatchProps => ({
  toggleDataset: (toggleoption: boolean) =>
    dispatch(toggleDataset(toggleoption)),
  toggleDatafile: (toggleoption: boolean) =>
    dispatch(toggleDatafile(toggleoption)),
  toggleInvestigation: (toggleoption: boolean) =>
    dispatch(toggleInvestigation(toggleoption)),
});

const mapStateToProps = (state: StateType): CheckBoxStoreProps => {
  return {
    dataset: state.dgsearch.checkBox.dataset,
    datafile: state.dgsearch.checkBox.datafile,
    investigation: state.dgsearch.checkBox.investigation,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CheckboxesGroup);
