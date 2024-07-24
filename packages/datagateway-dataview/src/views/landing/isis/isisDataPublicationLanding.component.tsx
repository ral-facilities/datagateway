import {
  Box,
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
  Assessment,
  CalendarToday,
  Public,
  Storage,
} from '@mui/icons-material';
import {
  DataPublication,
  useDataPublication,
  ArrowTooltip,
  getTooltipText,
  tableLink,
  AddToCartButton,
  ViewsType,
  parseSearchToQuery,
  useDataPublications,
  DownloadButton,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Branding from './isisBranding.component';
import CitationFormatter from '../../citationFormatter.component';
import { useHistory, useLocation } from 'react-router-dom';

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

export interface FormattedUser {
  contributorType?: string;
  fullName: string;
}

interface LandingPageProps {
  dataPublicationId: string;
}

interface LinkedInvestigationProps {
  investigation: DataPublication;
  urlPrefix: string;
  view: ViewsType;
}

const LinkedInvestigation = (
  props: LinkedInvestigationProps
): React.ReactElement => {
  const [t] = useTranslation();

  const investigation = props.investigation;

  const shortInvestigationInfo = [
    {
      content: (entity: DataPublication) =>
        entity.content?.dataCollectionInvestigations?.[0]?.investigation
          ?.investigationInstruments?.[0]?.instrument?.name,
      label: t('investigations.instrument'),
      icon: <Assessment sx={shortInfoIconStyle} />,
    },
    {
      content: (entity: DataPublication) =>
        entity.publicationDate?.slice(0, 10),
      label: t('investigations.release_date'),
      icon: <CalendarToday sx={shortInfoIconStyle} />,
    },
  ];

  return (
    <div>
      <Subheading
        variant="h6"
        align="center"
        data-testid="landing-datapublication-part-label"
      >
        {tableLink(
          `${props.urlPrefix}/investigation/${investigation.id}`,
          `${'Part DOI'}: ${investigation.pid}`,
          props.view
        )}
      </Subheading>
      {shortInvestigationInfo.map((field, i) => (
        <ShortInfoRow key={i}>
          <ShortInfoLabel>
            {field.icon}
            {field.label}:
          </ShortInfoLabel>
          <ArrowTooltip title={getTooltipText(field.content(investigation))}>
            <ShortInfoValue>{field.content(investigation)}</ShortInfoValue>
          </ArrowTooltip>
        </ShortInfoRow>
      ))}
      {investigation.content?.dataCollectionInvestigations?.[0]?.investigation
        ?.id && (
        <ActionButtonsContainer>
          <AddToCartButton
            entityType="investigation"
            allIds={[
              investigation.content.dataCollectionInvestigations[0]
                .investigation.id,
            ]}
            entityId={
              investigation.content.dataCollectionInvestigations[0]
                .investigation.id
            }
          />
          <DownloadButton
            entityType="investigation"
            entityId={
              investigation.content.dataCollectionInvestigations[0]
                .investigation.id
            }
            entityName={
              investigation.content.dataCollectionInvestigations[0]
                .investigation.name
            }
            entitySize={
              investigation.content.dataCollectionInvestigations[0]
                .investigation.fileSize ?? -1
            }
          />
        </ActionButtonsContainer>
      )}
    </div>
  );
};

const LandingPage = (props: LandingPageProps): React.ReactElement => {
  const [t] = useTranslation();
  const { push } = useHistory();
  const location = useLocation();
  const { view } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const [value, setValue] = React.useState<'details'>('details');
  const { dataPublicationId } = props;

  const { data: studyDataPublication } = useDataPublication(
    parseInt(dataPublicationId)
  );

  const { data: investigationDataPublications } = useDataPublications([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'content.dataCollectionInvestigations.investigation.dataCollectionInvestigations.dataCollection.dataPublications.id':
          {
            eq: dataPublicationId,
          },
      }),
    },
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'type.name': {
          eq: 'investigation',
        },
      }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify({
        content: {
          dataCollectionInvestigations: {
            investigation: {
              investigationInstruments: 'instrument',
            },
          },
        },
      }),
    },
  ]);

  const pid = studyDataPublication?.pid;
  const title = investigationDataPublications?.[0]?.title;
  const description = React.useMemo(
    () =>
      investigationDataPublications?.[0]?.description &&
      investigationDataPublications?.[0]?.description !== 'null'
        ? investigationDataPublications?.[0]?.description
        : 'Description not provided',
    [investigationDataPublications]
  );

  const formattedUsers = React.useMemo(() => {
    const principals: FormattedUser[] = [];
    const contacts: FormattedUser[] = [];
    const experimenters: FormattedUser[] = [];

    studyDataPublication?.users?.forEach((user) => {
      // Only keep users where we have their fullName
      const fullname = user.fullName;
      if (fullname) {
        switch (user.contributorType) {
          case 'principal_experimenter':
            principals.push({
              fullName: fullname,
              contributorType: 'Principal Investigator',
            });
            break;
          case 'local_contact':
            contacts.push({
              fullName: fullname,
              contributorType: 'Local Contact',
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

    // Ensure PIs are listed first, and sort within roles for consistency
    principals.sort((a, b) => a.fullName.localeCompare(b.fullName));
    contacts.sort((a, b) => a.fullName.localeCompare(b.fullName));
    experimenters.sort((a, b) => a.fullName.localeCompare(b.fullName));
    return principals.concat(contacts, experimenters);
  }, [studyDataPublication]);

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
  }, [t, title, pid, dataPublicationId, description, formattedUsers]);

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
      label: t('datapublications.pid'),
      icon: <Public sx={shortInfoIconStyle} />,
    },
    {
      content: function distributionFormat(entity: DataPublication) {
        return (
          <MuiLink href="http://www.isis.stfc.ac.uk/groups/computing/isis-raw-file-format11200.html">
            {t('doi_constants.distribution.format')}
          </MuiLink>
        );
      },
      label: t('datapublications.details.format'),
      icon: <Storage sx={shortInfoIconStyle} />,
    },
    {
      content: (dataPublication: DataPublication) =>
        dataPublication?.publicationDate?.slice(0, 10) ?? '',
      label: t('datapublications.publication_date'),
      icon: <CalendarToday sx={shortInfoIconStyle} />,
    },
  ];

  return (
    <Paper
      sx={{ margin: 1, padding: 1 }}
      data-testid="isis-dataPublication-landing"
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
                id="dataPublication-details-tab"
                aria-controls="datapublication-details-panel"
                label={t('datapublications.details.label')}
                value="details"
              />
              <Tab
                id="datapublication-investigations-tab"
                label={t('datapublications.details.investigations')}
                onClick={() =>
                  push(
                    view
                      ? `${location.pathname}/investigation?view=${view}`
                      : `${location.pathname}/investigation`
                  )
                }
              />
            </Tabs>
            <Divider />
          </Paper>
        </Grid>
        <Grid item container xs={12} id="datapublication-details-panel">
          {/* Long format information */}
          <Grid item xs>
            <Subheading variant="h5" data-testid="landing-investigation-title">
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

            <Subheading
              variant="h6"
              data-testid="landing-dataPublication-publisher-label"
            >
              {t('datapublications.details.publisher')}
            </Subheading>
            <Typography data-testid="landing-dataPublication-publisher">
              {t('doi_constants.publisher.name')}
            </Typography>
            <CitationFormatter
              doi={pid}
              formattedUsers={formattedUsers}
              title={title}
              startDate={studyDataPublication?.publicationDate}
            />
          </Grid>

          <Divider orientation="vertical" />
          {/* Short format information */}
          <Grid item xs={6} sm={5} md={4} lg={3} xl={2}>
            {shortInfo.map(
              (field, i) =>
                studyDataPublication &&
                field.content(studyDataPublication as DataPublication) && (
                  <ShortInfoRow key={i}>
                    <ShortInfoLabel>
                      {field.icon}
                      {field.label}:
                    </ShortInfoLabel>
                    <ArrowTooltip
                      title={getTooltipText(
                        field.content(studyDataPublication as DataPublication)
                      )}
                    >
                      <ShortInfoValue>
                        {field.content(studyDataPublication as DataPublication)}
                      </ShortInfoValue>
                    </ArrowTooltip>
                  </ShortInfoRow>
                )
            )}
            {/* Parts */}
            {investigationDataPublications?.map((dataPublication, i) => (
              <Box key={i} sx={{ my: 1 }}>
                <Divider />
                <LinkedInvestigation
                  investigation={dataPublication}
                  urlPrefix={location.pathname}
                  view={view}
                />
              </Box>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LandingPage;
