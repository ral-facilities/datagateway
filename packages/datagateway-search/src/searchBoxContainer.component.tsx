import React from 'react';

import { Grid, Box, Typography, Link } from '@material-ui/core';

import SelectDates from './search/datePicker.component';
import CheckboxesGroup from './search/checkBoxes.component';
import SearchButton from './search/searchButton.component';
import SearchTextBox from './search/searchTextBox.component';
import { Trans, useTranslation } from 'react-i18next';
import AdvancedHelpDialogue from './search/advancedHelpDialogue';
import { useSelector } from 'react-redux';
import { StateType } from './state/app.types';

interface SearchBoxContainerProps {
  searchText: string;
  initiateSearch: () => void;
  onSearchTextChange: (searchText: string) => void;
}

const SearchBoxContainer = (
  props: SearchBoxContainerProps
): React.ReactElement => {
  const { searchText, initiateSearch, onSearchTextChange } = props;
  const [t] = useTranslation();

  const maxNumResults = useSelector(
    (state: StateType) => state.dgsearch.maxNumResults
  );

  return (
    <Grid
      container
      direction="row"
      justify="center"
      alignItems="stretch"
      id="container-searchbox"
    >
      <Grid item xs={8}>
        <Box pl={2} pb={1}>
          <SearchTextBox
            searchText={searchText}
            initiateSearch={initiateSearch}
            onChange={onSearchTextChange}
          />
        </Box>
      </Grid>

      <Grid item style={{ display: 'flex' }}>
        <Box px={2} m="auto">
          <SearchButton initiateSearch={initiateSearch} />
        </Box>
      </Grid>

      <Grid item style={{ display: 'flex' }}>
        <Box px={2} m="auto">
          <AdvancedHelpDialogue />
        </Box>
      </Grid>

      <Grid container item justify="center" style={{ padding: 0, margin: 0 }}>
        <Typography style={{ fontSize: '14px', padding: 0, margin: 0 }}>
          <Trans t={t} i18nKey="searchBox.search_textbox_label">
            e.g. title has
            <Link href={t('searchBox.search_textbox_label_link1')}>
              &quot;instrument calibration&quot;
            </Link>
            , or{' '}
            <Link href={t('searchBox.search_textbox_label_link2')}>
              neutron AND scattering
            </Link>
            .
          </Trans>
        </Typography>
      </Grid>

      <Grid
        container
        item
        justify="center"
        style={{ paddingBottom: 8, paddingTop: 8 }}
      >
        <Grid item style={{ display: 'flex' }}>
          <Box m="auto">
            <CheckboxesGroup />
          </Box>
        </Grid>

        <Grid item>
          <Box px={0.75}>
            <SelectDates initiateSearch={initiateSearch} />
          </Box>
        </Grid>
      </Grid>

      <Typography style={{ margin: '10px' }}>
        {t('searchBox.limited_results_message', {
          maxNumResults,
        })}
      </Typography>
    </Grid>
  );
};

export default SearchBoxContainer;
