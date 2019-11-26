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
import { StateType } from '../state/app.types'
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

interface CheckboxProps{
  // do we need to put anything here?
}

interface CheckBoxStoreProps {
  dataset: boolean;
  datafile: boolean;
  investigation: boolean;
}

interface CheckBoxDispatchProps{
  toggleDataset: (toggleoption: boolean) => Action;
  toggleDatafile: (toggleoption: boolean) => Action;
  toggleInvestigation: (toggleoption: boolean) => Action;
}

function CheckboxesGroup(props): JSX.Element {
  const classes = useStyles();
  const [state, setState] = React.useState({
    Investigation: true,
    Dataset: false,
    Datafile: false,
  });

  const handleChange = (name: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setState({ ...state, [name]: event.target.checked });
    console.log('box checked?');
    console.log(event.target.checked)
    console.log(state)
  };

  const { Investigation, Dataset, Datafile } = state;
  const error = ![Investigation, Dataset, Datafile].includes(true);

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
                checked={Investigation}
                onChange={handleChange('Investigation')}
                value="Investigation"
              />
            }
            label="Investigation"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={Dataset}
                onChange={handleChange('Dataset')}
                value="Dataset"
              />
            }
            label="Dataset"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={Datafile}
                onChange={handleChange('Datafile')}
                value="Datafile"
              />
            }
            label="Datafile"
          />
        </FormGroup>
      </FormControl>
    </div>
  );
}

const mapDispatchToProps = (  dispatch: ThunkDispatch<StateType, null, AnyAction>
  ): CheckBoxDispatchProps => ({
    toggleDataset: (toggleoption: boolean) => dispatch(toggleDataset(toggleoption)),
    toggleDatafile: (toggleoption: boolean) => dispatch(toggleDatafile(toggleoption)),
    toggleInvestigation: (toggleoption: boolean) => dispatch(toggleInvestigation(toggleoption)),
  });


const mapStateToProps = (state: StateType): CheckBoxStoreProps => {
  return{
    dataset: state.dgsearch.checkBox.dataset,
    datafile: state.dgsearch.checkBox.datafile,
    investigation: state.dgsearch.checkBox.investigation,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(CheckboxesGroup);