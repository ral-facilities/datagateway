import {
  Divider,
  Grid,
  Link as MuiLink,
  Paper,
  styled,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  CalendarToday,
  Fingerprint,
  Public,
  Storage,
} from '@mui/icons-material';
import {
  DataPublication,
  useDataPublication,
  ArrowTooltip,
  getTooltipText,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Branding from './isisBranding.component';

const Subheading = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

const ShortInfoRow = styled('div')(({ theme }) => ({
  display: 'flex',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const shortInfoIconStyle = { mx: 1 };

const ShortInfoLabel = styled(Typography)({
  display: 'flex',
  width: '50%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const ShortInfoValue = styled(Typography)({
  width: '50%',
  textAlign: 'right',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

interface LandingPageProps {
  dataPublicationId: string;
}

const LandingPage = (props: LandingPageProps): React.ReactElement => {
  const [t] = useTranslation();

  const [value, setValue] = React.useState<'details'>('details');
  const { dataPublicationId } = props;

  const { data } = useDataPublication(parseInt(dataPublicationId));

  const pid = data?.[0].pid;
  const title = data?.[0].title;
  const description = React.useMemo(
    () =>
      data?.[0].description && data?.[0].description !== 'null'
        ? data[0].description
        : 'Description not provided',
    [data]
  );

  React.useEffect(() => {
    const scriptId = `dataPublication-${dataPublicationId}`;
    let structuredDataScript = document.getElementById(scriptId);

    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.id = scriptId;
      (structuredDataScript as HTMLScriptElement).type = 'application/ld+json';
      const head = document.getElementsByTagName('head')[0];
      head.appendChild(structuredDataScript);
    }

    structuredDataScript.innerHTML = JSON.stringify({
      '@context': 'http://schema.org',
      '@type': 'Dataset',
      '@id': pid ? `https://doi.org/${pid}` : '',
      url: pid ? `https://doi.org/${pid}` : '',
      identifier: pid,
      name: title,
      description: description,
      keywords: t('doi_constants.keywords', { returnObjects: true }),
      publisher: {
        '@type': 'Organization',
        url: t('doi_constants.publisher.url'),
        name: t('doi_constants.publisher.name'),
        logo: t('doi_constants.publisher.logo'),
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: t('doi_constants.publisher.email'),
          url: t('doi_constants.publisher.url'),
        },
      },
      includedInDataCatalog: {
        '@type': 'DataCatalog',
        url: t('doi_constants.distribution.content_url'),
      },
      distribution: [
        {
          '@type': 'DataDownload',
          encodingFormat: t('doi_constants.distribution.format'),
          // TODO format contentUrl with and actual download link if possible
          contentUrl: t('doi_constants.distribution.content_url'),
        },
      ],
    });

    return () => {
      const currentScript = document.getElementById(scriptId);
      if (currentScript) {
        currentScript.remove();
      }
    };
  }, [t, title, pid, dataPublicationId, description]);

  const shortInfo = [
    {
      content: function dataPublicationPidFormat(entity: DataPublication) {
        return (
          entity?.pid && (
            <MuiLink
              href={`https://doi.org/${entity.pid}`}
              data-testid="landing-dataPublication-pid-link"
            >
              {entity.pid}
            </MuiLink>
          )
        );
      },
      label: t('dataPublications.pid'),
      icon: <Public sx={shortInfoIconStyle} />,
    },
    {
      content: (entity: DataPublication) => entity.title,
      label: t('dataPublications.title'),
      icon: <Fingerprint sx={shortInfoIconStyle} />,
    },
    {
      content: function distributionFormat(entity: DataPublication) {
        return (
          <MuiLink href="http://www.isis.stfc.ac.uk/groups/computing/isis-raw-file-format11200.html">
            {t('doi_constants.distribution.format')}
          </MuiLink>
        );
      },
      label: t('dataPublications.details.format'),
      icon: <Storage sx={shortInfoIconStyle} />,
    },
    {
      content: (entity: DataPublication) => entity?.createTime,
      label: t('dataPublications.createTime'),
      icon: <CalendarToday sx={shortInfoIconStyle} />,
    },
  ];

  return (
    <Paper sx={{ margin: 1, padding: 1 }}>
      <Grid container sx={{ padding: 0.5 }}>
        <Grid item xs={12}>
          <Branding />
        </Grid>
        <Grid item xs={12}>
          <Paper square elevation={0} sx={{ mx: -1.5, px: 1.5 }}>
            <Tabs
              value={value}
              onChange={(event, newValue) => setValue(newValue)}
              indicatorColor="secondary"
              textColor="secondary"
            >
              <Tab
                id="dataPublication-details-tab"
                aria-controls="dataPublication-details-panel"
                label={t('dataPublications.details.label')}
                value="details"
              />
            </Tabs>
            <Divider />
          </Paper>
        </Grid>
        <Grid item container xs={12} id="dataPublication-details-panel">
          {/* Long format information */}
          <Grid item xs>
            <Subheading variant="h5" data-testid="landing-investigation-title">
              {title}
            </Subheading>
            <Typography data-testid="landing-dataPublication-description">
              {description}
            </Typography>

            <Subheading
              variant="h6"
              data-testid="landing-study-publisher-label"
            >
              {t('studies.details.publisher')}
            </Subheading>
            <Typography data-testid="landing-study-publisher">
              {t('doi_constants.publisher.name')}
            </Typography>
          </Grid>

          <Divider orientation="vertical" />
          {/* Short format information */}
          <Grid item xs={6} sm={5} md={4} lg={3} xl={2}>
            {shortInfo.map(
              (field, i) =>
                data?.[0] &&
                field.content(data[0] as DataPublication) && (
                  <ShortInfoRow key={i}>
                    <ShortInfoLabel>
                      {field.icon}
                      {field.label}:
                    </ShortInfoLabel>
                    <ArrowTooltip
                      title={getTooltipText(
                        field.content(data[0] as DataPublication)
                      )}
                    >
                      <ShortInfoValue>
                        {field.content(data[0] as DataPublication)}
                      </ShortInfoValue>
                    </ArrowTooltip>
                  </ShortInfoRow>
                )
            )}
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LandingPage;
