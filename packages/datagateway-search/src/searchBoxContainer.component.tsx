import React from 'react';

import { Grid, Typography, Link, Theme, Box, styled } from '@mui/material';

import SelectDates from './search/datePicker.component';
import CheckboxesGroup from './search/checkBoxes.component';
import SearchButton from './search/searchButton.component';
import SearchTextBox from './search/searchTextBox.component';
import { Trans, useTranslation } from 'react-i18next';
import AdvancedHelpDialogue from './search/advancedHelpDialogue.component';
import { useSelector } from 'react-redux';
import { StateType } from './state/app.types';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Link as RouterLink } from 'react-router-dom';

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
    <ContainerBox>
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
