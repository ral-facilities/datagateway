import {
  Box,
  Divider,
  Grid,
  Paper,
  styled,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  Assessment,
  Business,
  CalendarToday,
  Fingerprint,
  Public,
  Save,
  Storage,
} from '@mui/icons-material';
import {
  Dataset,
  Investigation,
  parseSearchToQuery,
  Publication,
  Sample,
  tableLink,
  useInvestigation,
  AddToCartButton,
  DownloadButton,
  ArrowTooltip,
  getTooltipText,
  formatBytes,
  externalSiteLink,
  useDataPublication,
  DataPublication,
  useDataPublications,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import CitationFormatter from '../../citationFormatter.component';
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

const ActionButtonsContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  '& button': {
    margin: 'auto',
    marginTop: theme.spacing(1),
  },
}));

interface FormattedUser {
  role?: string;
  contributorType?: string;
  fullName: string;
}

interface LandingPageProps {
  investigationId: string;
  dataPublication: boolean;
}

const InvestigationDataPublicationLandingPage = (
  props: LandingPageProps
): React.ReactElement => {
  const { investigationId } = props;

  const { data } = useDataPublication(parseInt(investigationId));

  const { data: studyDataPublications } = useDataPublications([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'content.dataCollectionInvestigations.investigation.dataCollectionInvestigations.dataCollection.dataPublications.id':
          {
            eq: investigationId,
          },
      }),
    },
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'type.name': {
          eq: 'study',
        },
      }),
    },
  ]);

  const studyDataPublication = studyDataPublications?.[0];

  return (
    <CommonLandingPage
      data={data}
      studyDataPublication={studyDataPublication}
    />
  );
};

const InvestigationLandingPage = (
  props: LandingPageProps
): React.ReactElement => {
  const { investigationId } = props;
  const { data } = useInvestigation(parseInt(investigationId), [
    {
      filterType: 'include',
      filterValue: JSON.stringify([
        {
          investigationUsers: 'user',
        },
        'samples',
        'publications',
        'datasets',
        {
          dataCollectionInvestigations: {
            dataCollection: { dataPublications: 'type' },
          },
        },
        {
          investigationInstruments: 'instrument',
        },
      ]),
    },
  ]);

  return <CommonLandingPage data={data} />;
};

interface CommonLandingPageProps {
  data?: DataPublication | Investigation[];
  studyDataPublication?: DataPublication;
}

const CommonLandingPage = (
  props: CommonLandingPageProps
): React.ReactElement => {
  const [t] = useTranslation();
  const { push } = useHistory();
  const location = useLocation();
  const { view } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
  const [value, setValue] = React.useState<'details'>('details');
  const { data, studyDataPublication } = props;

  const title = React.useMemo(
    () => (Array.isArray(data) ? data?.[0]?.title : data?.title),
    [data]
  );
  const doi = React.useMemo(
    () => (Array.isArray(data) ? data?.[0]?.doi : data?.pid),
    [data]
  );

  const formattedUsers = React.useMemo(() => {
    const principals: FormattedUser[] = [];
    const contacts: FormattedUser[] = [];
    const experimenters: FormattedUser[] = [];
    const users = Array.isArray(data)
      ? data?.[0]?.investigationUsers
      : data?.users;
    if (users) {
      users.forEach((u) => {
        let user: { role?: string; fullName?: string } = {};
        if ('user' in u) user = { fullName: u.user?.fullName, role: u.role };
        if ('contributorType' in u)
          user = { fullName: u.fullName, role: u.contributorType };
        // Only keep users where we have their fullName
        const fullname = user.fullName;
        if (fullname) {
          switch (user.role) {
            case 'principal_experimenter':
              principals.push({
                fullName: fullname,
                role: 'Principal Investigator',
              });
              break;
            case 'local_contact':
              contacts.push({ fullName: fullname, role: 'Local Contact' });
              break;
            default:
              experimenters.push({ fullName: fullname, role: 'Experimenter' });
          }
        }
      });
    }
    // Ensure PIs are listed first, and sort within roles for consistency
    principals.sort((a, b) => a.fullName.localeCompare(b.fullName));
    contacts.sort((a, b) => a.fullName.localeCompare(b.fullName));
    experimenters.sort((a, b) => a.fullName.localeCompare(b.fullName));
    return principals.concat(contacts, experimenters);
  }, [data]);

  const formattedPublications = React.useMemo(() => {
    if (Array.isArray(data) && data?.[0]?.publications) {
      return (data[0].publications as Publication[]).map(
        (publication) => publication.fullReference
      );
    }
  }, [data]);

  const formattedSamples = React.useMemo(() => {
    if (Array.isArray(data) && data?.[0]?.samples) {
      return (data[0].samples as Sample[]).map((sample) => sample.name);
    }
  }, [data]);

  const shortInfo = Array.isArray(data)
    ? [
        {
          content: () => data?.[0]?.visitId,
          label: t('investigations.visit_id'),
          icon: <Fingerprint sx={shortInfoIconStyle} />,
        },
        {
          content: function doiFormat() {
            return (
              data?.[0]?.doi &&
              externalSiteLink(
                `https://doi.org/${data[0].doi}`,
                data[0].doi,
                'isis-investigation-landing-doi-link'
              )
            );
          },
          label: t('investigations.doi'),
          icon: <Public sx={shortInfoIconStyle} />,
        },
        {
          content: function parentDoiFormat() {
            const studyDataPublication =
              data?.[0]?.dataCollectionInvestigations?.filter(
                (dci) =>
                  dci.dataCollection?.dataPublications?.[0]?.type?.name ===
                  'study'
              )?.[0]?.dataCollection?.dataPublications?.[0];
            return (
              studyDataPublication &&
              externalSiteLink(
                `https://doi.org/${studyDataPublication.pid}`,
                studyDataPublication.pid,
                'isis-investigations-landing-parent-doi-link'
              )
            );
          },
          label: t('investigations.parent_doi'),
          icon: <Public sx={shortInfoIconStyle} />,
        },
        {
          content: () => data?.[0]?.name,
          label: t('investigations.name'),
          icon: <Fingerprint sx={shortInfoIconStyle} />,
        },
        {
          content: () => {
            return formatBytes(data?.[0]?.fileSize);
          },
          label: t('investigations.size'),
          icon: <Save sx={shortInfoIconStyle} />,
        },
        {
          content: () => data?.[0]?.facility?.name,
          label: t('investigations.details.facility'),
          icon: <Business sx={shortInfoIconStyle} />,
        },
        {
          content: () =>
            data?.[0]?.investigationInstruments?.[0]?.instrument?.name,
          label: t('investigations.instrument'),
          icon: <Assessment sx={shortInfoIconStyle} />,
        },
        {
          content: function distributionFormat() {
            return externalSiteLink(
              'https://www.isis.stfc.ac.uk/Pages/ISIS-Raw-File-Format.aspx',
              t('doi_constants.distribution.format')
            );
          },
          label: t('datapublications.details.format'),
          icon: <Storage sx={shortInfoIconStyle} />,
        },
        {
          content: () => data?.[0]?.releaseDate?.slice(0, 10),
          label: t('investigations.release_date'),
          icon: <CalendarToday sx={shortInfoIconStyle} />,
        },
        {
          content: () => data?.[0]?.startDate?.slice(0, 10),
          label: t('investigations.start_date'),
          icon: <CalendarToday sx={shortInfoIconStyle} />,
        },
        {
          content: () => data?.[0]?.endDate?.slice(0, 10),
          label: t('investigations.end_date'),
          icon: <CalendarToday sx={shortInfoIconStyle} />,
        },
      ]
    : [
        {
          content: function doiFormat() {
            return (
              data?.pid &&
              externalSiteLink(
                `https://doi.org/${data.pid}`,
                data.pid,
                'isis-investigation-landing-doi-link'
              )
            );
          },
          label: t('investigations.doi'),
          icon: <Public sx={shortInfoIconStyle} />,
        },
        {
          content: function doiFormat() {
            return (
              studyDataPublication &&
              studyDataPublication?.pid &&
              externalSiteLink(
                `https://doi.org/${studyDataPublication.pid}`,
                studyDataPublication.pid,
                'isis-investigation-landing-doi-link'
              )
            );
          },
          label: t('investigations.parent_doi'),
          icon: <Public sx={shortInfoIconStyle} />,
        },
        {
          content: () => studyDataPublication && studyDataPublication.title,
          label: t('investigations.name'),
          icon: <Fingerprint sx={shortInfoIconStyle} />,
        },
        {
          content: () =>
            data?.content?.dataCollectionInvestigations?.[0].investigation
              ?.visitId ??
            (data?.pid.includes('-') && data.pid.split('-')[1]),
          label: t('investigations.visit_id'),
          icon: <Fingerprint sx={shortInfoIconStyle} />,
        },
        {
          content: () => data?.facility?.name,
          label: t('investigations.details.facility'),
          icon: <Business sx={shortInfoIconStyle} />,
        },
        {
          content: () =>
            data?.content?.dataCollectionInvestigations?.[0]?.investigation
              ?.investigationInstruments?.[0]?.instrument?.name,
          label: t('investigations.instrument'),
          icon: <Assessment sx={shortInfoIconStyle} />,
        },
        {
          content: function distributionFormat() {
            return externalSiteLink(
              'https://www.isis.stfc.ac.uk/Pages/ISIS-Raw-File-Format.aspx',
              t('doi_constants.distribution.format')
            );
          },
          label: t('datapublications.details.format'),
          icon: <Storage sx={shortInfoIconStyle} />,
        },
        {
          content: () => data?.publicationDate?.slice(0, 10),
          label: t('investigations.release_date'),
          icon: <CalendarToday sx={shortInfoIconStyle} />,
        },
      ];

  const shortDatasetInfo = Array.isArray(data)
    ? [
        {
          content: function doiFormat(entity: Dataset) {
            return (
              entity?.doi &&
              externalSiteLink(
                `https://doi.org/${entity.doi}`,
                entity.doi,
                'landing-study-doi-link'
              )
            );
          },
          label: t('datasets.doi'),
          icon: <Public sx={shortInfoIconStyle} />,
        },
      ]
    : [];

  return (
    <Paper
      data-testid="isis-investigation-landing"
      sx={{ margin: 1, padding: 1 }}
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
                id="investigation-details-tab"
                aria-controls="investigation-details-panel"
                label={t('investigations.details.label')}
                value="details"
              />
              {typeof data !== 'undefined' &&
                (Array.isArray(data) ||
                  data?.content?.dataCollectionInvestigations?.[0]
                    ?.investigation) && (
                  <Tab
                    id="investigation-datasets-tab"
                    label={t('investigations.details.datasets')}
                    onClick={() =>
                      push(
                        view
                          ? `${location.pathname}/dataset?view=${view}`
                          : `${location.pathname}/dataset`
                      )
                    }
                  />
                )}
            </Tabs>
            <Divider />
          </Paper>
        </Grid>
        <Grid item container xs={12} id="investigation-details-panel">
          {/* Long format information */}
          <Grid item xs>
            <Subheading variant="h5" aria-label="landing-investigation-title">
              {Array.isArray(data) ? data?.[0]?.title : data?.title}
            </Subheading>

            <Typography aria-label="landing-investigation-summary">
              {Array.isArray(data)
                ? data?.[0]?.summary && data[0].summary !== 'null'
                  ? data[0].summary
                  : 'Description not provided'
                : data?.description && data.description !== 'null'
                ? data.description
                : 'Description not provided'}
            </Typography>
            {formattedUsers.length > 0 && (
              <div>
                <Subheading
                  variant="h6"
                  aria-label="landing-investigation-users-label"
                >
                  {t('investigations.details.users.label')}
                </Subheading>
                {formattedUsers.map((user, i) => (
                  <Typography
                    aria-label={`landing-investigation-user-${i}`}
                    key={i}
                  >
                    <b>{user.role}:</b> {user.fullName}
                  </Typography>
                ))}
              </div>
            )}

            <Subheading
              variant="h6"
              aria-label="landing-investigation-publisher-label"
            >
              {t('datapublications.details.publisher')}
            </Subheading>
            <Typography aria-label="landing-investigation-publisher">
              {t('doi_constants.publisher.name')}
            </Typography>
            <CitationFormatter
              doi={doi}
              formattedUsers={formattedUsers}
              title={title}
              startDate={
                Array.isArray(data)
                  ? data?.[0]?.startDate
                  : data?.publicationDate
              }
            />

            {formattedSamples && (
              <div>
                <Subheading
                  variant="h6"
                  aria-label="landing-investigation-samples-label"
                >
                  {t('investigations.details.samples.label')}
                </Subheading>
                {formattedSamples.length === 0 && (
                  <Typography data-testid="investigation-details-panel-no-samples">
                    {t('investigations.details.samples.no_samples')}
                  </Typography>
                )}
                {formattedSamples.map((name, i) => (
                  <Typography
                    aria-label={`landing-investigation-sample-${i}`}
                    key={i}
                  >
                    {name}
                  </Typography>
                ))}
              </div>
            )}

            {formattedPublications && (
              <div>
                <Subheading
                  variant="h6"
                  aria-label="landing-investigation-publications-label"
                >
                  {t('investigations.details.publications.label')}
                </Subheading>
                {formattedPublications.length === 0 && (
                  <Typography data-testid="investigation-details-panel-no-publications">
                    {t('investigations.details.publications.no_publications')}
                  </Typography>
                )}
                {formattedPublications.map((reference, i) => (
                  <Typography
                    aria-label={`landing-investigation-reference-${i}`}
                    key={i}
                  >
                    {reference}
                  </Typography>
                ))}
              </div>
            )}
          </Grid>
          <Divider orientation="vertical" />
          {/* Short format information */}
          <Grid item xs={6} sm={5} md={4} lg={3} xl={2}>
            {shortInfo.map(
              (field, i) =>
                field.content() && (
                  <ShortInfoRow key={i}>
                    <ShortInfoLabel>
                      {field.icon}
                      {field.label}:
                    </ShortInfoLabel>
                    <ArrowTooltip title={getTooltipText(field.content())}>
                      <ShortInfoValue>{field.content()}</ShortInfoValue>
                    </ArrowTooltip>
                  </ShortInfoRow>
                )
            )}
            {/* Actions */}
            {(Array.isArray(data) ||
              data?.content?.dataCollectionInvestigations?.[0]?.investigation
                ?.id) && (
              <ActionButtonsContainer data-testid="investigation-landing-action-container">
                <AddToCartButton
                  entityType="investigation"
                  allIds={
                    Array.isArray(data)
                      ? [data?.[0]?.id]
                      : [
                          data.content?.dataCollectionInvestigations?.[0]
                            ?.investigation?.id as number,
                        ]
                  }
                  entityId={
                    Array.isArray(data)
                      ? data?.[0]?.id
                      : (data.content?.dataCollectionInvestigations?.[0]
                          ?.investigation?.id as number)
                  }
                />
              </ActionButtonsContainer>
            )}
            {/* Parts */}
            {(Array.isArray(data)
              ? data?.[0]
              : data?.content?.dataCollectionInvestigations?.[0]?.investigation
            )?.datasets?.map((dataset, i) => (
              <Box key={i} sx={{ my: 1 }}>
                <Divider />
                <Subheading
                  variant="h6"
                  align="center"
                  aria-label="landing-investigation-part-label"
                >
                  {tableLink(
                    `${location.pathname}/dataset/${dataset.id}`,
                    `${t('datasets.dataset')}: ${dataset.name}`,
                    view
                  )}
                </Subheading>
                {shortDatasetInfo.map(
                  (field, i) =>
                    field.content(dataset as Dataset) && (
                      <ShortInfoRow key={i}>
                        <ShortInfoLabel>
                          {field.icon}
                          {field.label}:
                        </ShortInfoLabel>
                        <ArrowTooltip
                          title={getTooltipText(
                            field.content(dataset as Dataset)
                          )}
                        >
                          <ShortInfoValue>
                            {field.content(dataset as Dataset)}
                          </ShortInfoValue>
                        </ArrowTooltip>
                      </ShortInfoRow>
                    )
                )}
                <ActionButtonsContainer
                  data-testid={`investigation-landing-dataset-${i}-action-container`}
                >
                  <AddToCartButton
                    entityType="dataset"
                    allIds={[dataset.id]}
                    entityId={dataset.id}
                  />
                  <DownloadButton
                    entityType="dataset"
                    entityId={dataset.id}
                    entityName={dataset.name}
                    entitySize={dataset.fileSize ?? -1}
                  />
                </ActionButtonsContainer>
              </Box>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

const LandingPage = (props: LandingPageProps): React.ReactElement => {
  if (props.dataPublication) {
    return <InvestigationDataPublicationLandingPage {...props} />;
  } else {
    return <InvestigationLandingPage {...props} />;
  }
};

export default LandingPage;
