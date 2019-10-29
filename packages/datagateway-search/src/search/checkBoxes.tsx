import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

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

export default function CheckboxesGroup(): JSX.Element {
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
  };

  const { Investigation, Dataset, Datafile } = state;
  const error = ![Investigation, Dataset, Datafile].includes(true)

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
