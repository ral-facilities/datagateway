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

const DOITypeSelector = (): React.ReactElement => {
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
    <Grid container item direction="column" ml={1} xs="auto">
      <Grid item>
        <Typography component={'label'} id="doi-type-selector-label">
          {t('my_doi_table.button_group_aria_label')}
        </Typography>
      </Grid>
      <Grid item>
        <ToggleButtonGroup
          value={doiType ?? 'minter'}
          color="primary"
          exclusive
          onChange={handleType}
          aria-labelledby="doi-type-selector-label"
          size="small"
        >
          {/* Padding values to make these buttons the same height as the clear filters button */}
          <ToggleButton value="minter" sx={{ p: '3px 7px' }}>
            {t('my_doi_table.minter')}
          </ToggleButton>
          <ToggleButton value="user" sx={{ p: '3px 7px' }}>
            {t('my_doi_table.user')}
          </ToggleButton>
          <ToggleButton value="session" sx={{ p: '3px 7px' }}>
            {t('my_doi_table.session')}
          </ToggleButton>
        </ToggleButtonGroup>
      </Grid>
    </Grid>
  );
};

export default DOITypeSelector;
