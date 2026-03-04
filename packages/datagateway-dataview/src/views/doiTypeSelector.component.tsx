import React from 'react';

import {
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  DOIViewType,
  parseSearchToQuery,
  usePushQueryParams,
} from 'datagateway-common';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface DOITypeSelectorProps {
  type: 'myDOIs' | 'allDOIs';
}

const DOITypeSelector = (props: DOITypeSelectorProps): React.ReactElement => {
  const { type } = props;
  const location = useLocation();
  const { doiType } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const [t] = useTranslation();

  const pushQueryParams = usePushQueryParams();

  const handleType = (
    _event: React.MouseEvent<HTMLElement>,
    newType: NonNullable<DOIViewType>
  ): void => {
    pushQueryParams({ doiType: newType });
  };

  return (
    <Grid container item direction="row" xs="auto" spacing={1}>
      <Grid container item direction="column" ml={1} xs="auto">
        <Grid item>
          <Typography component={'label'} id="doi-type-selector-label">
            {type === 'myDOIs'
              ? t('my_doi_table.type_button_group_aria_label')
              : t('all_doi_table.type_button_group_aria_label')}
          </Typography>
        </Grid>
        <Grid item>
          <ToggleButtonGroup
            value={doiType ?? (type === 'myDOIs' ? 'minter' : 'session')}
            exclusive
            onChange={handleType}
            aria-labelledby="doi-type-selector-label"
            size="small"
          >
            {/* Padding values to make these buttons the same height as the clear filters button */}
            {type === 'myDOIs' && (
              <ToggleButton value="minter" sx={{ p: '3px 7px' }}>
                {t('my_doi_table.minter')}
              </ToggleButton>
            )}
            <ToggleButton value="user" sx={{ p: '3px 7px' }}>
              {type === 'myDOIs'
                ? t('my_doi_table.user')
                : t('all_doi_table.user')}
            </ToggleButton>
            <ToggleButton value="session" sx={{ p: '3px 7px' }}>
              {type === 'myDOIs'
                ? t('my_doi_table.session')
                : t('all_doi_table.session')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
      {/* TODO: uncomment when we can query datagateway-api for is null/is not null */}
      {/* {(doiType === 'session' ||
        doiType === 'closedSession' ||
        doiType === 'openSession') && (
        <Grid container item direction="column" xs="auto">
          <Grid item>
            <Typography component={'label'} id="doi-type-selector-label">
              {type === 'myDOIs'
                ? t('my_doi_table.open_button_group_aria_label')
                : t('all_doi_table.open_button_group_aria_label')}
            </Typography>
          </Grid>
          <Grid item>
            <ToggleButtonGroup
              value={doiType}
              exclusive
              onChange={handleType}
              aria-labelledby="doi-type-selector-label"
              size="small"
            >
              <ToggleButton value="session" sx={{ p: '3px 7px' }}>
                {type === 'myDOIs'
                  ? t('my_doi_table.open_or_closed')
                  : t('all_doi_table.open_or_closed')}
              </ToggleButton>
              <ToggleButton value="openSession" sx={{ p: '3px 7px' }}>
                {type === 'myDOIs'
                  ? t('my_doi_table.open')
                  : t('all_doi_table.open')}
              </ToggleButton>
              <ToggleButton value="closedSession" sx={{ p: '3px 7px' }}>
                {type === 'myDOIs'
                  ? t('my_doi_table.closed')
                  : t('all_doi_table.closed')}
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      )} */}
    </Grid>
  );
};

export default DOITypeSelector;
