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
import {
  ContributorType,
  DataPublication,
  DOIRelationType,
  readSciGatewayToken,
  useDataPublication,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Branding from './dlsBranding.component';
import CitationFormatter from '../../citationFormatter.component';
import DLSDataPublicationContentTable from './dlsDataPublicationContentTable.component';
import DLSDataPublicationVersionPanel, {
  sortVersions,
} from './dlsDataPublicationVersionPanel.component';
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

  const [currentTab, setCurrentTab] = React.useState<'details' | 'content'>(
    'details'
  );
  const { dataPublicationId } = props;

  const { data } = useDataPublication(parseInt(dataPublicationId));

  const isVersionDOI = data?.relatedItems?.some(
    (relatedItem) => relatedItem.relationType === DOIRelationType.IsVersionOf
  );

  const pid = data?.pid;
  const title = data?.title;
  const description = React.useMemo(
    () =>
      data?.description && data?.description !== 'null'
        ? data?.description
        : 'Description not provided',
    [data]
  );

  const latestVersionPid = data?.relatedItems
    ?.filter(
      (relatedItem) => relatedItem.relationType === DOIRelationType.HasVersion
    )
    .sort(sortVersions)?.[0]?.identifier;

  const formattedUsers = React.useMemo(() => {
    const principals: FormattedUser[] = [];
    const experimenters: FormattedUser[] = [];

    if (data?.users) {
      const dataPublicationUsers = data.users;
      dataPublicationUsers.forEach((user) => {
        // Only keep users where we have their fullName
        const fullname = user.fullName;
        if (fullname) {
          switch (user.contributorType) {
            case ContributorType.Minter:
              principals.push({
                fullName: fullname,
                contributorType: 'Principal Investigator',
              });
              break;
            default:
              experimenters.push({
                fullName: fullname,
                contributorType: user.contributorType,
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
    // only add structured data for concept DOI landing pages
    // TODO: we might want all versions to be searchable though - check with DLS
    // in that case we'll likely need to exclude the concept to ensure we're not duplicating the latest version...
    if (isVersionDOI === false) {
      const scriptId = `dataPublication-${dataPublicationId}`;
      let structuredDataScript = document.getElementById(scriptId);

      if (!structuredDataScript) {
        structuredDataScript = document.createElement('script');
        structuredDataScript.id = scriptId;
        (structuredDataScript as HTMLScriptElement).type =
          'application/ld+json';
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
        creator: formattedUsers.map((user) => {
          return { '@type': 'Person', name: user.fullName };
        }),
        includedInDataCatalog: {
          '@type': 'DataCatalog',
          url: t('doi_constants.distribution.content_url'),
        },
        license: t('doi_constants.distribution.license'),
      });

      return () => {
        const currentScript = document.getElementById(scriptId);
        if (currentScript) {
          currentScript.remove();
        }
      };
    }
  }, [
    t,
    title,
    pid,
    dataPublicationId,
    description,
    formattedUsers,
    isVersionDOI,
  ]);

  const shortInfo = [
    ...(isVersionDOI
      ? [
          {
            content: function dataPublicationPidFormat(
              entity: DataPublication
            ) {
              return <StyledDOI doi={entity.pid} />;
            },
            label: t('datapublications.pid'),
          },
          {
            content: function dataPublicationPidFormat(
              entity: DataPublication
            ) {
              const conceptPid = data?.relatedItems?.filter(
                (relatedItem) =>
                  relatedItem.relationType === DOIRelationType.IsVersionOf
              )?.[0]?.identifier;
              if (conceptPid) return <StyledDOI doi={conceptPid} />;
            },
            label: `${t('datapublications.concept')} ${t(
              'datapublications.pid'
            )}`,
          },
        ]
      : [
          {
            content: function dataPublicationPidFormat(
              entity: DataPublication
            ) {
              if (latestVersionPid) return <StyledDOI doi={latestVersionPid} />;
            },
            label: `${t('datapublications.latest_version')} ${t(
              'datapublications.pid'
            )}`,
          },
          {
            content: function dataPublicationPidFormat(
              entity: DataPublication
            ) {
              return <StyledDOI doi={entity.pid} />;
            },
            label: `${t('datapublications.concept')} ${t(
              'datapublications.pid'
            )}`,
          },
        ]),
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
        <Grid container item xs={12}>
          <Paper square elevation={0} sx={{ mx: -1.5, px: 1.5, width: '100%' }}>
            <Grid container>
              <Grid item xs>
                <Tabs
                  value={currentTab}
                  onChange={(event, newValue) => setCurrentTab(newValue)}
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
                </Tabs>
              </Grid>
              {/* Only let the minter edit the DOI & only if it's a concept DOI */}
              {isVersionDOI === false &&
                data?.users?.some(
                  (user) =>
                    user.user?.name === readSciGatewayToken().username &&
                    user.contributorType === ContributorType.Minter
                ) && (
                  <Grid item xs="auto" alignSelf="center">
                    <IconButton
                      sx={{ ml: 'auto' }}
                      onClick={() =>
                        history.push({
                          pathname: `${dataPublicationId}/edit`,
                          state: { fromEdit: true },
                        })
                      }
                      aria-label={t('datapublications.edit_label')}
                    >
                      <Edit />
                    </IconButton>
                  </Grid>
                )}
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>

        <TabPanel value={currentTab} index="details">
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

              {isVersionDOI === false && (
                <CitationFormatter
                  label={`${t('datapublications.latest_version')} ${t(
                    'datapublications.details.citation_formatter.label'
                  )}`}
                  doi={latestVersionPid}
                  formattedUsers={formattedUsers}
                  title={title}
                  startDate={data?.publicationDate}
                />
              )}
              <CitationFormatter
                label={
                  isVersionDOI === false
                    ? `${t('datapublications.concept')} ${t(
                        'datapublications.details.citation_formatter.label'
                      )}`
                    : undefined
                }
                doi={pid}
                formattedUsers={formattedUsers}
                title={title}
                startDate={data?.publicationDate}
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
                  data &&
                  field.content(data) && (
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
                        <ShortInfoValue>{field.content(data)}</ShortInfoValue>
                      </Grid>
                    </Grid>
                  )
              )}
              {isVersionDOI === false && (
                <Grid item sx={{ pt: '0px !important' }}>
                  <DLSDataPublicationVersionPanel
                    dataPublicationId={dataPublicationId}
                  />
                </Grid>
              )}
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={currentTab} index="content">
          <DLSDataPublicationContentTable
            dataPublicationId={dataPublicationId}
          />
        </TabPanel>
      </Grid>
    </Paper>
  );
};

export default LandingPage;
