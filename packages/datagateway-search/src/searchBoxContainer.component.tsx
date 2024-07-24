import React from 'react';
import { Box, Grid, Link, styled, Theme, Typography } from '@mui/material';
import SelectDates from './search/datePicker.component';
import CheckboxesGroup from './search/checkBoxes.component';
import SearchButton from './search/searchButton.component';
import SearchTextBox from './search/searchTextBox.component';
import AdvancedHelpDialogue from './search/advancedHelpDialogue.component';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import SortSelectComponent from './search/sortSelect.component';
import MyDataCheckBox from './search/myDataCheckBox.component';
import { Location } from 'history';

const ContainerBox = styled(Box)(({ theme }) => ({
  maxWidth: '1920px',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  margin: 'auto',
  justifyContent: 'center',
}));

interface SearchBoxContainerProps {
  searchText: string;
  restrict: boolean;
  loggedInAnonymously: boolean;
  initiateSearch: () => void;
  onSearchTextChange: (searchText: string) => void;
  onMyDataCheckboxChange: (checked: boolean) => void;
}

const SearchBoxContainer = (
  props: SearchBoxContainerProps
): React.ReactElement => {
  const {
    searchText,
    restrict,
    loggedInAnonymously,
    initiateSearch,
    onSearchTextChange,
    onMyDataCheckboxChange,
  } = props;
  const [t] = useTranslation();

  function searchTextExampleLink(exampleSearchText: string) {
    return (location: Location): Location => {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('searchText', exampleSearchText);
      return {
        ...location,
        search: searchParams.toString(),
      };
    };
  }

  return (
    <ContainerBox data-testid="search-box-container">
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Grid
          container
          direction="row"
          justifyContent="center"
          id="container-searchbox"
        >
          <Grid item xs="auto" style={{ flexGrow: 1 }}>
            <SearchTextBox
              searchText={searchText}
              initiateSearch={initiateSearch}
              onChange={onSearchTextChange}
            />
          </Grid>

          <Grid item sx={{ marginTop: '8px' }}>
            <CheckboxesGroup />
          </Grid>

          <Grid item sx={{ marginTop: '8px' }}>
            <SelectDates initiateSearch={initiateSearch} />
          </Grid>

          <Grid item style={{ marginTop: '8px' }}>
            <SortSelectComponent />
          </Grid>

          {/* Only show the "my data" search box if the user is logged in
              because "my data" means data specific to a user,
              which doesn't make sense if the user is not logged in. */}
          {!loggedInAnonymously && (
            <Grid item style={{ marginTop: '8px' }}>
              <MyDataCheckBox
                checked={restrict}
                onChange={onMyDataCheckboxChange}
              />
            </Grid>
          )}

          <Grid
            item
            sx={{ display: 'flex', marginTop: '24px', marginLeft: '6px' }}
          >
            <SearchButton initiateSearch={initiateSearch} />
          </Grid>
        </Grid>
      </form>
      <div style={{ display: 'flex' }}>
        <Typography
          sx={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            color: (theme: Theme) => (theme as any).colours?.contrastGrey,
            textAlign: 'left',
            fontSize: '14px',
          }}
        >
          <Trans t={t} i18nKey="searchBox.examples_label">
            For example
            <Link
              component={RouterLink}
              sx={{ fontWeight: 'bold' }}
              to={searchTextExampleLink('"instrument calibration"')}
            >
              &quot;instrument calibration&quot;
            </Link>
            or{' '}
            <Link
              component={RouterLink}
              sx={{ fontWeight: 'bold' }}
              to={searchTextExampleLink('neutron AND scattering')}
            >
              neutron AND scattering
            </Link>
            .
          </Trans>{' '}
          <AdvancedHelpDialogue />
        </Typography>
      </div>
    </ContainerBox>
  );
};

export default SearchBoxContainer;
