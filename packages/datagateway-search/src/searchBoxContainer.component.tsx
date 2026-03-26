import { Box, Grid, Link, styled, Theme, Typography } from '@mui/material';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation } from 'react-router';
import AdvancedHelpDialog from './search/advancedHelpDialog.component';
import CheckboxesGroup from './search/checkBoxes.component';
import SelectDates from './search/datePicker.component';
import MyDataCheckBox from './search/myDataCheckBox.component';
import SearchButton from './search/searchButton.component';
import SearchTextBox from './search/searchTextBox.component';
import SortSelectComponent from './search/sortSelect.component';

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

function searchTextExampleLink(
  exampleSearchText: string,
  location: ReturnType<typeof useLocation>
) {
  const searchParams = new URLSearchParams(location.search);
  searchParams.set('searchText', exampleSearchText);
  return {
    ...location,
    search: searchParams.toString(),
  };
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
  const location = useLocation();

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
              to={searchTextExampleLink(
                t('searchBox.examples_label_link1'),
                location
              )}
            >
              &quot;instrument calibration&quot;
            </Link>
            or{' '}
            <Link
              component={RouterLink}
              sx={{ fontWeight: 'bold' }}
              to={searchTextExampleLink(
                t('searchBox.examples_label_link2'),
                location
              )}
            >
              neutron AND scattering
            </Link>
            .
          </Trans>{' '}
          <AdvancedHelpDialog />
        </Typography>
      </div>
    </ContainerBox>
  );
};

export default SearchBoxContainer;
