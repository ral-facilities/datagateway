import React from 'react';

import {
  Grid,
  Typography,
  Link,
  makeStyles,
  createStyles,
  Theme,
  Box,
} from '@material-ui/core';

import SelectDates from './search/datePicker.component';
import CheckboxesGroup from './search/checkBoxes.component';
import SearchButton from './search/searchButton.component';
import SearchTextBox from './search/searchTextBox.component';
import { Trans, useTranslation } from 'react-i18next';
import AdvancedHelpDialogue from './search/advancedHelpDialogue.component';
import { Link as RouterLink } from 'react-router-dom';
import SortSelectComponent from './search/sortSelect.component';
import MyDataCheckBox from './search/myDataCheckBox.component';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    infoIcon: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      color: (theme as any).colours?.contrastGrey,
    },
    containerBox: {
      maxWidth: '1920px',
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      margin: 'auto',
      justifyContent: 'center',
    },
    leftText: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      color: (theme as any).colours?.contrastGrey,
      textAlign: 'left',
      fontSize: '14px',
    },
    rightText: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      color: (theme as any).colours?.contrastGrey,
      textAlign: 'right',
      fontSize: '14px',
      marginLeft: 'auto',
    },
    bold: {
      fontWeight: 'bold',
    },
  })
);

interface SearchBoxContainerProps {
  searchText: string;
  initiateSearch: () => void;
  onSearchTextChange: (searchText: string) => void;
}

const SearchBoxContainer = (
  props: SearchBoxContainerProps
): React.ReactElement => {
  const { searchText, initiateSearch, onSearchTextChange } = props;
  const classes = useStyles();
  const [t] = useTranslation();

  return (
    <Box className={classes.containerBox}>
      <Grid container direction="row" justify="center" id="container-searchbox">
        <Grid item xs="auto" style={{ flexGrow: 1 }}>
          <SearchTextBox
            searchText={searchText}
            initiateSearch={initiateSearch}
            onChange={onSearchTextChange}
          />
        </Grid>

        <Grid item style={{ marginTop: '8px' }}>
          <CheckboxesGroup />
        </Grid>

        <Grid item style={{ marginTop: '8px' }}>
          <SelectDates initiateSearch={initiateSearch} />
        </Grid>

        <Grid item style={{ marginTop: '8px' }}>
          <SortSelectComponent />
        </Grid>

        <Grid item style={{ marginTop: '8px' }}>
          <MyDataCheckBox />
        </Grid>

        <Grid
          item
          style={{ display: 'flex', marginTop: '24px', marginLeft: 6 }}
        >
          <SearchButton initiateSearch={initiateSearch} />
        </Grid>
      </Grid>
      <div style={{ display: 'flex' }}>
        <Typography className={classes.leftText}>
          <Trans t={t} i18nKey="searchBox.examples_label">
            For example
            <Link
              component={RouterLink}
              style={{ fontWeight: 'bold' }}
              to={t('searchBox.examples_label_link1')}
            >
              &quot;instrument calibration&quot;
            </Link>
            or{' '}
            <Link
              component={RouterLink}
              style={{ fontWeight: 'bold' }}
              to={t('searchBox.examples_label_link2')}
            >
              neutron AND scattering
            </Link>
            .
          </Trans>{' '}
          <AdvancedHelpDialogue />
        </Typography>
      </div>
    </Box>
  );
};

export default SearchBoxContainer;
