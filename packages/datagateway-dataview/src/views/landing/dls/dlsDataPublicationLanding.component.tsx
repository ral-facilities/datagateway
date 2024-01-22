import {
  Box,
  Divider,
  Grid,
  IconButton,
  Paper,
  styled,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { DataPublication, useDataPublication } from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Branding from './dlsBranding.component';
import CitationFormatter from '../../citationFormatter.component';
import DLSDataPublicationContentTable from './dlsDataPublicationContentTable.component';
import DLSDataPublicationVersionPanel from './dlsDataPublicationVersionPanel.component';
import { Edit } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';

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

const StyledDOILink = styled('a')({
  display: 'inline-flex',
  backgroundColor: '#000',
  color: '#fff',
  textDecoration: 'none',
  paddingLeft: '5px',
  borderRadius: '5px',
  overflow: 'hidden',
});

const StyledDOISpan = styled('span')({
  backgroundColor: '#09c',
  padding: '0 5px',
  marginLeft: '5px',
  '&:hover': {
    backgroundColor: '#006a8d',
  },
});

export const StyledDOI: React.FC<{ doi: string }> = ({ doi }) => (
  <StyledDOILink
    href={`https://doi.org/${doi}`}
    data-testid="landing-dataPublication-pid-link"
  >
    DOI <StyledDOISpan>{doi}</StyledDOISpan>
  </StyledDOILink>
);

export interface FormattedUser {
  contributorType?: string;
  fullName: string;
}

interface LandingPageProps {
  dataPublicationId: string;
}

type TabPanelProps = {
  children?: React.ReactNode;
  index: string;
  value: string;
  height?: string;
};

const TabPanel = React.forwardRef((props: TabPanelProps, ref) => {
  const { children, value, index, height, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`datapublication-${index}-panel`}
      aria-labelledby={`datapublication-${index}-tab`}
      sx={{ width: '100%', height }}
      ref={ref}
      {...other}
    >
      {value === index && children}
    </Box>
  );
});
TabPanel.displayName = 'TabPanel';

const LandingPage = (props: LandingPageProps): React.ReactElement => {
  const [t] = useTranslation();

  const history = useHistory();

  const [value, setValue] = React.useState<'details'>('details');
  const { dataPublicationId } = props;

  const { data } = useDataPublication(parseInt(dataPublicationId));

  const pid = data?.[0]?.pid;
  const title = data?.[0]?.title;
  const description = React.useMemo(
    () =>
      data?.[0]?.description && data?.[0]?.description !== 'null'
        ? data[0]?.description
        : 'Description not provided',
    [data]
  );

  const formattedUsers = React.useMemo(() => {
    const principals: FormattedUser[] = [];
    const experimenters: FormattedUser[] = [];

    if (data?.[0]?.users) {
      const dataPublicationUsers = data[0]?.users;
      dataPublicationUsers.forEach((user) => {
        // Only keep users where we have their fullName
        const fullname = user.fullName;
        if (fullname) {
          switch (user.contributorType) {
            case 'minter':
              principals.push({
                fullName: fullname,
                contributorType: 'Principal Investigator',
              });
              break;
            default:
              experimenters.push({
                fullName: fullname,
                contributorType: 'Experimenter',
              });
          }
        }
      });
    }
    // Ensure PIs are listed first, and sort within roles for consistency
    principals.sort((a, b) => a.fullName.localeCompare(b.fullName));
    experimenters.sort((a, b) => a.fullName.localeCompare(b.fullName));
    return principals.concat(experimenters);
  }, [data]);

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
        return <StyledDOI doi={entity.pid} />;
      },
      label: t('datapublications.pid'),
    },
    {
      content: (dataPublication: DataPublication) =>
        dataPublication.publicationDate?.slice(0, 10) ?? '',
      label: t('datapublications.publication_date'),
    },
    {
      content: (dataPublication: DataPublication) =>
        t('doi_constants.publisher.name'),
      label: t('datapublications.details.publisher'),
    },
    {
      content: (dataPublication: DataPublication) => dataPublication.type?.name,
      label: t('datapublications.details.type'),
    },
  ];

  return (
    <Paper
      sx={{
        margin: 1,
        padding: 1,
      }}
      data-testid="dls-dataPublication-landing"
    >
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
                id="datapublication-details-tab"
                aria-controls="datapublication-details-panel"
                label={t('datapublications.details.label')}
                value="details"
              />
              <Tab
                id="datapublication-content-tab"
                aria-controls="datapublication-content-panel"
                label={t('datapublications.content_tab_label')}
                value="content"
              />
              <IconButton
                sx={{ ml: 'auto' }}
                onClick={() =>
                  history.push({
                    pathname: `${dataPublicationId}/edit`,
                    state: { fromEdit: true },
                  })
                }
              >
                <Edit />
              </IconButton>
            </Tabs>
            <Divider />
          </Paper>
        </Grid>

        <TabPanel value={value} index="details">
          <Grid item container xs={12} id="datapublication-details-panel">
            {/* Long format information */}
            <Grid item xs>
              <Subheading
                variant="h5"
                data-testid="landing-investigation-title"
              >
                {title}
              </Subheading>
              <Typography data-testid="landing-datapublication-description">
                {description}
              </Typography>

              {formattedUsers.length > 0 && (
                <div>
                  <Subheading
                    variant="h6"
                    data-testid="landing-dataPublication-users-label"
                  >
                    {t('datapublications.details.users')}
                  </Subheading>
                  {formattedUsers.map((user, i) => (
                    <Typography
                      data-testid={`landing-dataPublication-user-${i}`}
                      key={i}
                    >
                      <b>{user.contributorType}:</b> {user.fullName}
                    </Typography>
                  ))}
                </div>
              )}

              <CitationFormatter
                doi={pid}
                formattedUsers={formattedUsers}
                title={title}
                startDate={data?.[0]?.createTime}
              />
            </Grid>

            <Divider orientation="vertical" flexItem sx={{ ml: 1, mr: 1 }} />
            {/* Short format information */}
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
                  data?.[0] &&
                  field.content(data[0] as DataPublication) && (
                    <Grid
                      container
                      item
                      key={i}
                      spacing={1}
                      direction={'column'}
                    >
                      <Grid item>
                        <ShortInfoLabel>{field.label}</ShortInfoLabel>
                      </Grid>
                      <Grid item>
                        <ShortInfoValue>
                          {field.content(data[0] as DataPublication)}
                        </ShortInfoValue>
                      </Grid>
                    </Grid>
                  )
              )}
              <Grid container item spacing={1} direction={'column'}>
                <DLSDataPublicationVersionPanel
                  dataPublicationId={dataPublicationId}
                />
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={value} index="content">
          <DLSDataPublicationContentTable
            dataPublicationId={dataPublicationId}
          />
        </TabPanel>
      </Grid>
    </Paper>
  );
};

export default LandingPage;
