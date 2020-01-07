import React from 'react';
import { makeStyles, Paper, Tabs } from '@material-ui/core';
import Tab from '@material-ui/core/Tab';
// import DownloadCartTable from './downloadCart/downloadCartTable.component';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
});

const DownloadTabs: React.FC = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (
    event: React.ChangeEvent<{}>,
    newValue: number
  ): void => {
    setValue(newValue);
  };

  return (
    <Paper className={classes.root}>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab label="Cart" />
        <Tab label="Status" />
      </Tabs>
    </Paper>
  );
};

export default DownloadTabs;
