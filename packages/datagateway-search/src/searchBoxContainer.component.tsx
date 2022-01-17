import React from 'react';

import {
  Grid,
  Typography,
  Link,
  makeStyles,
  createStyles,
  Theme,
} from '@material-ui/core';

import SelectDates from './search/datePicker.component';
import CheckboxesGroup from './search/checkBoxes.component';
import SearchButton from './search/searchButton.component';
import SearchTextBox from './search/searchTextBox.component';
import { Trans, useTranslation } from 'react-i18next';
import AdvancedHelpDialogue from './search/advancedHelpDialogue.component';
import { useSelector } from 'react-redux';
import { StateType } from './state/app.types';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    leftText: {
      textAlign: 'left',
      fontSize: '14px',
      textIndent: '16px',
    },
    rightText: {
      textAlign: 'right',
      fontSize: '14px',
      right: 0,
      paddingRight: '16px',
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

  const maxNumResults = useSelector(
    (state: StateType) => state.dgsearch.maxNumResults
  );

  return (
    <div>
      <Grid container direction="row" justify="center" id="container-searchbox">
        <Grid item xs={6}>
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

        <Grid
          item
          style={{ display: 'flex', marginTop: '24px', marginLeft: 6 }}
        >
          <SearchButton initiateSearch={initiateSearch} />
        </Grid>
      </Grid>
      <div style={{ display: 'flex' }}>
        <Typography className={classes.leftText}>
          <Trans t={t} i18nKey="searchBox.search_textbox_label">
            For example
            <Link
              style={{ fontWeight: 'bold' }}
              href={t('searchBox.search_textbox_label_link1')}
            >
              &quot;instrument calibration&quot;
            </Link>
            or{' '}
            <Link
              style={{ fontWeight: 'bold' }}
              href={t('searchBox.search_textbox_label_link2')}
            >
              neutron AND scattering
            </Link>
            .
          </Trans>
          <AdvancedHelpDialogue />
        </Typography>

        <div className={classes.rightText}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <InfoOutlinedIcon fontSize="small" />{' '}
            <Typography
              display="inline"
              style={{ paddingLeft: '6px', fontSize: '14px' }}
            >
              {t('searchBox.limited_results_message', {
                maxNumResults,
              })}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBoxContainer;
