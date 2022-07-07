import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { parseSearchToQuery, usePushSearchRestrict } from 'datagateway-common';
import { useLocation } from 'react-router-dom';
import { Checkbox, FormControlLabel } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      marginTop: '15px',
    },
    formLabel: {
      margin: 'auto',
      marginRight: theme.spacing(2),
    },
  })
);

const MyDataCheckBox = (): React.ReactElement => {
  const classes = useStyles();
  const [t] = useTranslation();

  const location = useLocation();
  const restrict = React.useMemo(() => {
    return parseSearchToQuery(location.search).restrict;
  }, [location.search]);
  const pushSearchRestrict = usePushSearchRestrict();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const restrict = event.target.checked;
    pushSearchRestrict(restrict);
  };

  return (
    <div className={classes.root}>
      <FormControlLabel
        className={classes.formLabel}
        control={<Checkbox defaultChecked={restrict} onChange={handleChange} />}
        label={t('check_boxes.my_data')}
      />
    </div>
  );
};

export default MyDataCheckBox;
