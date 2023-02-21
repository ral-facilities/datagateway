import React from 'react';
import {
  Typography,
  Grid,
  Divider,
  Tabs,
  Tab,
  Link,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Entity, Instrument } from '../../app.types';
import { useInstrumentDetails } from '../../api';
import type { IsisInstrumentDetailsPanelChangeTabPayload } from '../../state/actions/actions.types';
import { IsisInstrumentDetailsPanelChangeTabType } from '../../state/actions/actions.types';
import type { StateType } from '../../state/app.types';
import type { Action } from '../../state/reducers/createReducer';

const DEFAULT_TAB: IsisInstrumentDetailsPanelTab = 'details';

const StyledGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

interface InstrumentDetailsPanelProps {
  rowData: Entity;
  detailsPanelResize?: () => void;
}

/**
 * Available tabs for the ISIS instrument details panel.
 */
export type IsisInstrumentDetailsPanelTab = 'details' | 'users';

const InstrumentDetailsPanel = (
  props: InstrumentDetailsPanelProps
): React.ReactElement => {
  const { rowData, detailsPanelResize } = props;

  const [t] = useTranslation();
  const { data } = useInstrumentDetails(rowData.id);
  const instrumentData: Instrument = { ...data, ...(rowData as Instrument) };
  const selectedTab = useSelector<
    StateType,
    IsisInstrumentDetailsPanelTab | undefined
  >(
    (state) =>
      data && state.dgcommon.isisInstrumentDetailsPanel[data.id]?.selectedTab
  );
  const dispatch = useDispatch();

  const changeTab = React.useCallback(
    (newTab: IsisInstrumentDetailsPanelTab) => {
      const id = data?.id;
      if (id) {
        dispatch<Action>({
          type: IsisInstrumentDetailsPanelChangeTabType,
          payload: {
            newTab,
            instrumentId: id,
          } as IsisInstrumentDetailsPanelChangeTabPayload,
        });
      }
    },
    [data?.id, dispatch]
  );

  React.useLayoutEffect(() => {
    if (detailsPanelResize && selectedTab) detailsPanelResize();
  }, [selectedTab, detailsPanelResize]);

  React.useEffect(() => {
    if (data && !selectedTab) {
      // register the selected tab for this instrument's details panel
      // for the first time.
      // go to the default tab on first render
      changeTab(DEFAULT_TAB);
    }
  }, [data, selectedTab, changeTab]);

  return (
    <div id="details-panel" style={{ minWidth: 0 }}>
      <Tabs
        variant="scrollable"
        textColor="secondary"
        indicatorColor="secondary"
        scrollButtons="auto"
        value={selectedTab ?? DEFAULT_TAB}
        onChange={(_, newValue) => changeTab(newValue)}
        aria-label={t('instruments.details.tabs_label')}
      >
        <Tab
          id="instrument-details-tab"
          aria-controls="instrument-details-panel"
          label={t('instruments.details.label')}
          value="details"
        />
        {instrumentData.instrumentScientists && (
          <Tab
            id="instrument-users-tab"
            aria-controls="instrument-users-panel"
            label={t('instruments.details.instrument_scientists.label')}
            value="users"
          />
        )}
      </Tabs>
      <div
        id="instrument-details-panel"
        aria-labelledby="instrument-details-tab"
        role="tabpanel"
        hidden={selectedTab !== 'details'}
      >
        <StyledGrid container direction="column">
          <Grid item xs>
            <Typography variant="h6">
              <b>{instrumentData.fullName || instrumentData.name}</b>
            </Typography>
            <StyledDivider />
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('instruments.details.description')}
            </Typography>
            <Typography>
              <b>
                {instrumentData.description &&
                instrumentData.description !== 'null'
                  ? instrumentData.description
                  : `${t('instruments.details.description')} not provided`}
              </b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('instruments.details.type')}
            </Typography>
            <Typography>
              <b>
                {instrumentData.type && instrumentData.type !== 'null'
                  ? instrumentData.type
                  : `${t('instruments.details.type')} not provided`}
              </b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('instruments.details.url')}
            </Typography>
            <Typography>
              <b>
                {instrumentData.url && instrumentData.url !== 'null' ? (
                  <Link href={instrumentData.url}>{instrumentData.url}</Link>
                ) : (
                  `${t('instruments.details.url')} not provided`
                )}
              </b>
            </Typography>
          </Grid>
        </StyledGrid>
      </div>
      {instrumentData.instrumentScientists && (
        <div
          id="instrument-users-panel"
          aria-labelledby="instrument-users-tab"
          role="tabpanel"
          hidden={selectedTab !== 'users'}
        >
          <StyledGrid container direction="column">
            <Typography variant="overline">
              {t('instruments.details.instrument_scientists.name', {
                count: instrumentData.instrumentScientists.length,
              })}
            </Typography>
            {instrumentData.instrumentScientists.length > 0 ? (
              instrumentData.instrumentScientists.map((instrumentScientist) => {
                if (instrumentScientist.user) {
                  return (
                    <Grid key={instrumentScientist.user.id} item xs>
                      <Typography>
                        <b>
                          {instrumentScientist.user.fullName ||
                            instrumentScientist.user.name}
                        </b>
                      </Typography>
                    </Grid>
                  );
                } else {
                  return null;
                }
              })
            ) : (
              <Typography data-testid="instrument-details-panel-no-name">
                <b>{t('instruments.details.instrument_scientists.no_name')}</b>
              </Typography>
            )}
          </StyledGrid>
        </div>
      )}
    </div>
  );
};

export default InstrumentDetailsPanel;
