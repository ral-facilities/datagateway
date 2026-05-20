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
    newType: DOIViewType | null
  ): void => {
    if (newType !== null)
      pushQueryParams({
        doiType: {
          view: newType,
          open:
            newType === 'minter' || newType === 'user'
              ? undefined
              : doiType?.open,
        },
      });
  };

  const handleOpenOrClosed = (
    _event: React.MouseEvent<HTMLElement>,
    newOpenOrClosed: boolean | 'undefined' | null
  ): void => {
    if (newOpenOrClosed !== null)
      pushQueryParams({
        doiType: {
          view: doiType?.view ?? 'all',
          open: newOpenOrClosed === 'undefined' ? undefined : newOpenOrClosed,
        },
      });
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
            value={doiType?.view ?? 'all'}
            exclusive
            onChange={handleType}
            aria-labelledby="doi-type-selector-label"
            size="small"
          >
            {/* Padding values to make these buttons the same height as the clear filters button */}
            <ToggleButton value="all" sx={{ p: '3px 7px' }}>
              {type === 'myDOIs'
                ? t('my_doi_table.all')
                : t('all_doi_table.all')}
            </ToggleButton>
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
      {(doiType === null ||
        doiType.view === 'all' ||
        doiType.view === 'session') && (
        <Grid container item direction="column" xs="auto">
          <Grid item>
            <Typography component={'label'} id="doi-open-selector-label">
              {type === 'myDOIs'
                ? t('my_doi_table.open_button_group_aria_label')
                : t('all_doi_table.open_button_group_aria_label')}
            </Typography>
          </Grid>
          <Grid item>
            <ToggleButtonGroup
              value={doiType?.open ?? 'undefined'}
              exclusive
              onChange={handleOpenOrClosed}
              aria-labelledby="doi-open-selector-label"
              size="small"
            >
              <ToggleButton value={'undefined'} sx={{ p: '3px 7px' }}>
                {type === 'myDOIs'
                  ? t('my_doi_table.open_or_closed')
                  : t('all_doi_table.open_or_closed')}
              </ToggleButton>
              <ToggleButton value={true} sx={{ p: '3px 7px' }}>
                {type === 'myDOIs'
                  ? t('my_doi_table.open')
                  : t('all_doi_table.open')}
              </ToggleButton>
              <ToggleButton value={false} sx={{ p: '3px 7px' }}>
                {type === 'myDOIs'
                  ? t('my_doi_table.closed')
                  : t('all_doi_table.closed')}
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default DOITypeSelector;
