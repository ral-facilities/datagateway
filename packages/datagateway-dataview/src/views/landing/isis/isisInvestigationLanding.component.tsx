import {
  Box,
  Divider,
  Grid,
  Paper,
  styled,
  Tab,
  Tabs,
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';
import {
  Assessment,
  Business,
  CalendarToday,
  Fingerprint,
  Public,
  Save,
  Storage,
  ExpandMore,
} from '@mui/icons-material';
import {
  Dataset,
  formatCountOrSize,
  Investigation,
  InvestigationUser,
  parseSearchToQuery,
  Publication,
  Sample,
  tableLink,
  useInvestigation,
  useInvestigationSizes,
  AddToCartButton,
  DownloadButton,
  ArrowTooltip,
  getTooltipText,
  externalSiteLink,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import CitationFormatter from '../../citationFormatter.component';
import Branding from './isisBranding.component';
import SuggestedInvestigationsSection from './suggestedInvestigationsSection.component';

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
  fullName: string;
}

interface LandingPageProps {
  instrumentId: string;
  instrumentChildId: string;
  investigationId: string;
  dataPublication: boolean;
}

const LandingPage = (props: LandingPageProps): React.ReactElement => {
  const [t] = useTranslation();
  const { push } = useHistory();
  const location = useLocation();
  const { view } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
  const [value, setValue] = React.useState<'details'>('details');
  const { instrumentId, instrumentChildId, investigationId, dataPublication } =
    props;

  const pathRoot = dataPublication ? 'browseDataPublications' : 'browse';
  const instrumentChild = dataPublication ? 'dataPublication' : 'facilityCycle';
  const urlPrefix = `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${instrumentChildId}/investigation/${investigationId}`;

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
          dataCollectionInvestigations: { dataCollection: 'dataPublications' },
        },
        {
          investigationInstruments: 'instrument',
        },
      ]),
    },
  ]);
  const sizeQueries = useInvestigationSizes(data);

  const title = React.useMemo(() => data?.[0]?.title, [data]);
  const doi = React.useMemo(() => data?.[0]?.doi, [data]);

  const formattedUsers = React.useMemo(() => {
    const principals: FormattedUser[] = [];
    const contacts: FormattedUser[] = [];
    const experimenters: FormattedUser[] = [];
    if (data?.[0]?.investigationUsers) {
      const investigationUsers = data?.[0]
        .investigationUsers as InvestigationUser[];
      investigationUsers.forEach((user) => {
        // Only keep users where we have their fullName
        const fullname = user.user?.fullName;
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
    if (data?.[0]?.publications) {
      return (data[0].publications as Publication[]).map(
        (publication) => publication.fullReference
      );
    }
  }, [data]);

  const formattedSamples = React.useMemo(() => {
    if (data?.[0]?.samples) {
      return (data[0].samples as Sample[]).map((sample) => sample.name);
    }
  }, [data]);

  const shortInfo = [
    {
      content: (entity: Investigation) => entity.visitId,
      label: t('investigations.visit_id'),
      icon: <Fingerprint sx={shortInfoIconStyle} />,
    },
    {
      content: function doiFormat(entity: Investigation) {
        return (
          entity?.doi &&
          externalSiteLink(
            `https://doi.org/${entity.doi}`,
            entity.doi,
            'isis-investigation-landing-doi-link'
          )
        );
      },
      label: t('investigations.doi'),
      icon: <Public sx={shortInfoIconStyle} />,
    },
    // TODO: when datapublications are created for studies, need to pick the study datapublication
    {
      content: function parentDoiFormat(entity: Investigation) {
        return (
          entity.dataCollectionInvestigations?.[0]?.dataCollection
            ?.dataPublications?.[0] &&
          externalSiteLink(
            `https://doi.org/${entity.dataCollectionInvestigations?.[0]?.dataCollection?.dataPublications?.[0].pid}`,
            entity.dataCollectionInvestigations?.[0]?.dataCollection
              ?.dataPublications?.[0].pid,
            'isis-investigations-landing-parent-doi-link'
          )
        );
      },
      label: t('investigations.parent_doi'),
      icon: <Public sx={shortInfoIconStyle} />,
    },
    {
      content: (entity: Investigation) => entity.name,
      label: t('investigations.name'),
      icon: <Fingerprint sx={shortInfoIconStyle} />,
    },
    {
      content: (entity: Investigation) => {
        return formatCountOrSize(sizeQueries[0], true);
      },
      label: t('investigations.size'),
      icon: <Save sx={shortInfoIconStyle} />,
    },
    {
      content: (entity: Investigation) => entity.facility?.name,
      label: t('investigations.details.facility'),
      icon: <Business sx={shortInfoIconStyle} />,
    },
    {
      content: (entity: Investigation) =>
        entity.investigationInstruments?.[0]?.instrument?.name,
      label: t('investigations.instrument'),
      icon: <Assessment sx={shortInfoIconStyle} />,
    },
    {
      content: function distributionFormat(entity: Investigation) {
        return externalSiteLink(
          'https://www.isis.stfc.ac.uk/Pages/ISIS-Raw-File-Format.aspx',
          t('doi_constants.distribution.format')
        );
      },
      label: t('datapublications.details.format'),
      icon: <Storage sx={shortInfoIconStyle} />,
    },
    {
      content: (entity: Investigation) => entity.releaseDate?.slice(0, 10),
      label: t('investigations.release_date'),
      icon: <CalendarToday sx={shortInfoIconStyle} />,
    },
    {
      content: (entity: Investigation) => entity.startDate?.slice(0, 10),
      label: t('investigations.start_date'),
      icon: <CalendarToday sx={shortInfoIconStyle} />,
    },
    {
      content: (entity: Investigation) => entity.endDate?.slice(0, 10),
      label: t('investigations.end_date'),
      icon: <CalendarToday sx={shortInfoIconStyle} />,
    },
  ];

  const shortDatasetInfo = [
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
  ];

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
              <Tab
                id="investigation-datasets-tab"
                label={t('investigations.details.datasets')}
                onClick={() =>
                  push(
                    view
                      ? `${urlPrefix}/dataset?view=${view}`
                      : `${urlPrefix}/dataset`
                  )
                }
              />
            </Tabs>
            <Divider />
          </Paper>
        </Grid>
        <Grid item container xs={12} id="investigation-details-panel">
          {/* Long format information */}
          <Grid item xs>
            <Subheading variant="h5" aria-label="landing-investigation-title">
              {data?.[0]?.title}
            </Subheading>

            <Typography aria-label="landing-investigation-summary">
              {data?.[0]?.summary && data[0].summary !== 'null'
                ? data[0].summary
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
              startDate={data?.[0]?.startDate}
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
            {data && data[0]?.summary && (
              <SuggestedInvestigationsSection investigation={data[0]} />
            )}
            <Accordion defaultExpanded disableGutters elevation={0}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                {t('investigations.landingPage.extraInfo')}
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0.5, py: 0 }}>
                {shortInfo.map(
                  (field, i) =>
                    data?.[0] &&
                    field.content(data[0] as Investigation) && (
                      <ShortInfoRow key={i}>
                        <ShortInfoLabel>
                          {field.icon}
                          {field.label}:
                        </ShortInfoLabel>
                        <ArrowTooltip
                          title={getTooltipText(
                            field.content(data[0] as Investigation)
                          )}
                        >
                          <ShortInfoValue>
                            {field.content(data[0] as Investigation)}
                          </ShortInfoValue>
                        </ArrowTooltip>
                      </ShortInfoRow>
                    )
                )}
              </AccordionDetails>
            </Accordion>
            {/* Actions */}
            <ActionButtonsContainer data-testid="investigation-landing-action-container">
              <AddToCartButton
                entityType="investigation"
                allIds={[parseInt(investigationId)]}
                entityId={parseInt(investigationId)}
              />
            </ActionButtonsContainer>
            {/* Parts */}
            {(data?.[0] as Investigation)?.datasets?.map((dataset, i) => (
              <Box key={i} sx={{ my: 1 }}>
                <Divider />
                <Subheading
                  variant="h6"
                  align="center"
                  aria-label="landing-investigation-part-label"
                >
                  {tableLink(
                    `${urlPrefix}/dataset/${dataset.id}`,
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
                    entitySize={sizeQueries[0]?.data ?? -1}
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

export default LandingPage;
