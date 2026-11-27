import React from 'react';

import {
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  DOIViewType,
  StyledTooltip,
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
          open: newType === 'user' ? undefined : doiType?.open,
          pi: doiType?.pi,
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
          pi: doiType?.pi,
        },
      });
  };

  const handlePIorAny = (
    _event: React.MouseEvent<HTMLElement>,
    newPIorAny: boolean | 'undefined' | null
  ): void => {
    if (newPIorAny !== null)
      pushQueryParams({
        doiType: {
          view: doiType?.view ?? 'all',
          open: doiType?.open,
          pi: newPIorAny === 'undefined' ? undefined : newPIorAny,
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
            <StyledTooltip
              title={
                type === 'myDOIs'
                  ? t('my_doi_table.all_tooltip')
                  : t('all_doi_table.all_tooltip')
              }
            >
              <ToggleButton value="all" sx={{ p: '3px 7px' }}>
                {type === 'myDOIs'
                  ? t('my_doi_table.all')
                  : t('all_doi_table.all')}
              </ToggleButton>
            </StyledTooltip>

            <StyledTooltip
              title={
                type === 'myDOIs'
                  ? t('my_doi_table.user_tooltip')
                  : t('all_doi_table.user_tooltip')
              }
            >
              <ToggleButton value="user" sx={{ p: '3px 7px' }}>
                {type === 'myDOIs'
                  ? t('my_doi_table.user')
                  : t('all_doi_table.user')}
              </ToggleButton>
            </StyledTooltip>
            <StyledTooltip
              title={
                type === 'myDOIs'
                  ? t('my_doi_table.session_tooltip')
                  : t('all_doi_table.session_tooltip')
              }
            >
              <ToggleButton value="session" sx={{ p: '3px 7px' }}>
                {type === 'myDOIs'
                  ? t('my_doi_table.session')
                  : t('all_doi_table.session')}
              </ToggleButton>
            </StyledTooltip>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
      {type === 'myDOIs' && (
        <Grid container item direction="column" xs="auto">
          <Grid item>
            <Typography component={'label'} id="doi-pi-selector-label">
              {t('my_doi_table.pi_button_group_aria_label')}
            </Typography>
          </Grid>
          <Grid item>
            <ToggleButtonGroup
              value={doiType?.pi ?? 'undefined'}
              exclusive
              onChange={handlePIorAny}
              aria-labelledby="doi-pi-selector-label"
              size="small"
            >
              <StyledTooltip title={t('my_doi_table.pi_or_any_tooltip')}>
                <ToggleButton value={'undefined'} sx={{ p: '3px 7px' }}>
                  {t('my_doi_table.pi_or_any')}
                </ToggleButton>
              </StyledTooltip>
              <StyledTooltip title={t('my_doi_table.pi_tooltip')}>
                <ToggleButton value={true} sx={{ p: '3px 7px' }}>
                  {t('my_doi_table.pi')}
                </ToggleButton>
              </StyledTooltip>
              <StyledTooltip title={t('my_doi_table.any_tooltip')}>
                <ToggleButton value={false} sx={{ p: '3px 7px' }}>
                  {t('my_doi_table.any')}
                </ToggleButton>
              </StyledTooltip>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      )}
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
              <StyledTooltip
                title={
                  type === 'myDOIs'
                    ? t('my_doi_table.open_or_closed_tooltip')
                    : t('all_doi_table.open_or_closed_tooltip')
                }
              >
                <ToggleButton value={'undefined'} sx={{ p: '3px 7px' }}>
                  {type === 'myDOIs'
                    ? t('my_doi_table.open_or_closed')
                    : t('all_doi_table.open_or_closed')}
                </ToggleButton>
              </StyledTooltip>
              <StyledTooltip
                title={
                  type === 'myDOIs'
                    ? t('my_doi_table.open_tooltip')
                    : t('all_doi_table.open_tooltip')
                }
              >
                <ToggleButton value={true} sx={{ p: '3px 7px' }}>
                  {type === 'myDOIs'
                    ? t('my_doi_table.open')
                    : t('all_doi_table.open')}
                </ToggleButton>
              </StyledTooltip>
              <StyledTooltip
                title={
                  type === 'myDOIs'
                    ? t('my_doi_table.closed_tooltip')
                    : t('all_doi_table.closed_tooltip')
                }
              >
                <ToggleButton value={false} sx={{ p: '3px 7px' }}>
                  {type === 'myDOIs'
                    ? t('my_doi_table.closed')
                    : t('all_doi_table.closed')}
                </ToggleButton>
              </StyledTooltip>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default DOITypeSelector;
