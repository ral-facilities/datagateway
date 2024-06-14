import React from 'react';
import { Box, Grid, Link, styled, Theme, Typography } from '@mui/material';
import SelectDates from './search/datePicker.component';
import CheckboxesGroup from './search/checkBoxes.component';
import SearchButton from './search/searchButton.component';
import SearchTextBox from './search/searchTextBox.component';
import AdvancedHelpDialogue from './search/advancedHelpDialogue.component';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { StateType } from './state/app.types';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Link as RouterLink } from 'react-router-dom';
import SearchTypeDropdown, {
  SearchType,
} from './search/searchTypeDropdown.component';

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
  searchType: SearchType;
  initiateSearch: () => void;
  onSearchTextChange: (searchText: string) => void;
  onSearchTypeChange: (searchType: SearchType) => void;
}

const SearchBoxContainer = (
  props: SearchBoxContainerProps
): React.ReactElement => {
  const {
    searchText,
    searchType,
    initiateSearch,
    onSearchTextChange,
    onSearchTypeChange,
  } = props;
  const [t] = useTranslation();

  const maxNumResults = useSelector(
    (state: StateType) => state.dgsearch.maxNumResults
  );

  return (
    <ContainerBox data-testid="search-box-container">
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
          <div style={{ display: 'flex' }}>
            <SearchTypeDropdown
              searchType={searchType}
              onChange={onSearchTypeChange}
            />
          </div>
        </Grid>

        <Grid item sx={{ marginTop: '8px' }}>
          <SelectDates initiateSearch={initiateSearch} />
        </Grid>

        <Grid
          item
          sx={{ display: 'flex', marginTop: '24px', marginLeft: '6px' }}
        >
          <SearchButton initiateSearch={initiateSearch} />
        </Grid>
      </Grid>
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
              to={t('searchBox.examples_label_link1')}
            >
              &quot;instrument calibration&quot;
            </Link>
            or{' '}
            <Link
              component={RouterLink}
              sx={{ fontWeight: 'bold' }}
              to={t('searchBox.examples_label_link2')}
            >
              neutron AND scattering
            </Link>
            .
          </Trans>{' '}
          <AdvancedHelpDialogue />
        </Typography>

        <Box
          sx={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            color: (theme: Theme) => (theme as any).colours?.contrastGrey,
            textAlign: 'right',
            fontSize: '14px',
            marginLeft: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'nowrap',
            }}
          >
            <InfoOutlinedIcon
              sx={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                color: (theme: Theme) => (theme as any).colours?.contrastGrey,
              }}
              fontSize="small"
            />{' '}
            <Typography
              display="inline"
              sx={{ paddingLeft: '6px', fontSize: '14px' }}
            >
              {t('searchBox.limited_results_message', {
                maxNumResults,
              })}
            </Typography>
          </div>
        </Box>
      </div>
    </ContainerBox>
  );
};

export default SearchBoxContainer;
