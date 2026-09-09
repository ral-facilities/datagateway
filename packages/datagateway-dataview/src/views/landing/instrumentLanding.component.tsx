import {
  CircularProgress,
  Divider,
  Grid,
  Link,
  Paper,
  Typography,
  styled,
} from '@mui/material';
import { Instrument, useInstrumentDetails } from 'datagateway-common';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { StateType } from '../../state/app.types';
import StyledDOI from './StyledDOILink.component';
import Branding from './branding.component';

const Subheading = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

const ShortInfoLabel = styled(Typography)({
  fontWeight: 'bold',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const ShortInfoValue = styled(Typography)({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

interface LandingPageProps {
  instrumentId: string;
}

const BaseInstrumentLandingPage = (
  props: LandingPageProps
): React.ReactElement => {
  const [t] = useTranslation();
  const doiHandleUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.doiHandleUrl
  );

  const { instrumentId } = props;

  const { data, isLoading } = useInstrumentDetails(parseInt(instrumentId));

  const pid = data?.pid;
  const name = data?.fullName ?? data?.name;
  const description = data?.description ?? t('doi_constants.no_description');

  const formattedUsers = React.useMemo(() => {
    const users: { fullName: string; contributorType: string }[] = [];

    data?.instrumentScientists?.forEach((instrumentScientist) => {
      // Only keep users where we have their fullName
      const fullname = instrumentScientist.user?.fullName;
      if (fullname) {
        users.push({
          fullName: fullname,
          contributorType: 'Instrument Scientist', // we don't actually use this
        });
      }
    });

    return users;
  }, [data?.instrumentScientists]);

  const shortInfo = [
    {
      content: function instrumentPidFormat(entity: Instrument) {
        return (
          entity?.pid && (
            <StyledDOI
              doi={entity.pid}
              doiHandleUrl={doiHandleUrl}
              testId="landing-intrument-pid-link"
            />
          )
        );
      },
      label: t('instruments.pid'),
    },
    {
      content: (instrument: Instrument) => instrument?.type,
      label: t('instruments.type'),
    },
    {
      content: (_instrument: Instrument) => (
        <Trans
          i18nKey={'instruments.owner_value'}
          components={{ Link: <Link /> }}
        />
      ),
      label: t('instruments.owner'),
    },
    {
      content: (_instrument: Instrument) => (
        <Trans
          i18nKey={'instruments.manufacturer_value'}
          components={{ Link: <Link /> }}
        />
      ),
      label: t('instruments.manufacturer'),
    },
    {
      content: (instrument: Instrument) =>
        instrument?.startDate?.slice(0, 10) ?? '',
      label: t('instruments.start_date'),
    },
    {
      content: (instrument: Instrument) =>
        instrument?.endDate?.slice(0, 10) ?? '',
      label: t('instruments.end_date'),
    },
  ];

  React.useEffect(() => {
    const scriptId = `instrument-${instrumentId}`;

    if (!document.getElementById(scriptId) && pid) {
      const newMetaTag = document.createElement('meta');
      newMetaTag.id = scriptId;
      newMetaTag.name = 'DC.identifier';
      newMetaTag.content = `doi:${pid}`;
      const head = document.getElementsByTagName('head')[0];
      head.appendChild(newMetaTag);
    }

    return () => {
      const currentMetaTag = document.getElementById(scriptId);
      if (currentMetaTag) {
        currentMetaTag.remove();
      }
    };
  }, [instrumentId, pid]);

  return (
    <Paper sx={{ margin: 1, padding: 1 }} data-testid="instrument-landing">
      <Grid container sx={{ padding: 0.5 }} direction="column">
        <Grid item xs={12} mb={2}>
          <Branding landingPageType="instrument" />
        </Grid>
        {isLoading ? (
          <Grid item alignSelf="center" pt={1}>
            <CircularProgress color="secondary" />
          </Grid>
        ) : (
          <Grid item container xs={12} id="instrument-details-panel">
            {/* Long format information */}
            <Grid item xs>
              <Subheading variant="h5" data-testid="landing-instrument-title">
                {name}
              </Subheading>
              <Typography data-testid="landing-instrument-description">
                {description}
              </Typography>

              {formattedUsers.length > 0 && (
                <div>
                  <Subheading
                    variant="h6"
                    data-testid="landing-instrument-users-label"
                  >
                    {t('instruments.details.instrument_scientists.label')}
                  </Subheading>
                  {formattedUsers.map((user, i) => (
                    <Typography
                      data-testid={`landing-instrument-user-${i}`}
                      key={i}
                    >
                      {user.fullName}
                    </Typography>
                  ))}
                </div>
              )}
            </Grid>

            <Divider orientation="vertical" flexItem sx={{ ml: 1, mr: 1 }} />
            {/* Short format information */}
            {shortInfo.some((field) => data && field.content(data)) && (
              <Grid
                container
                item
                xs="auto"
                direction="column"
                spacing={1}
                mt={0}
              >
                {shortInfo.map(
                  (field, i) =>
                    data &&
                    field.content(data) && (
                      <Grid
                        container
                        item
                        key={i}
                        spacing={1}
                        direction="column"
                      >
                        <Grid item>
                          <ShortInfoLabel>{field.label}</ShortInfoLabel>
                        </Grid>
                        <Grid item>
                          <ShortInfoValue>{field.content(data)}</ShortInfoValue>
                        </Grid>
                      </Grid>
                    )
                )}
              </Grid>
            )}
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

const InstrumentLandingPage = () => {
  const { instrumentId = '' } = useParams<{ instrumentId: string }>();

  return <BaseInstrumentLandingPage instrumentId={instrumentId} />;
};

export default InstrumentLandingPage;
