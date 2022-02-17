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
  Fingerprint,
  Public,
  Storage,
} from '@mui/icons-material';
import {
  Investigation,
  InvestigationUser,
  parseSearchToQuery,
  Study,
  tableLink,
  useStudy,
  ViewsType,
  AddToCartButton,
  ArrowTooltip,
  getTooltipText,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import Branding from './isisBranding.component';
import CitationFormatter from '../../citationFormatter.component';

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
  role: string;
  fullName: string;
}

interface LandingPageProps {
  instrumentId: string;
  studyId: string;
}

interface LinkedInvestigationProps {
  investigation: Investigation;
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
      content: function doiFormat(entity: Investigation) {
        return (
          entity?.doi && (
            <MuiLink
              href={`https://doi.org/${entity.doi}`}
              data-testid="landing-study-doi-link"
            >
              {entity.doi}
            </MuiLink>
          )
        );
      },
      label: t('investigations.doi'),
      icon: <Public sx={shortInfoIconStyle} />,
    },
    {
      content: (entity: Investigation) =>
        entity.investigationInstruments?.[0]?.instrument?.name,
      label: t('investigations.instrument'),
      icon: <Assessment sx={shortInfoIconStyle} />,
    },
    {
      content: (entity: Investigation) => entity.releaseDate?.slice(0, 10),
      label: t('investigations.release_date'),
      icon: <CalendarToday sx={shortInfoIconStyle} />,
    },
  ];

  return (
    <div>
      <Subheading
        variant="h6"
        align="center"
        data-testid="landing-study-part-label"
      >
        {tableLink(
          `${props.urlPrefix}/investigation/${investigation.id}`,
          `${t('investigations.visit_id')}: ${investigation.visitId}`,
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
      <ActionButtonsContainer>
        <AddToCartButton
          entityType="investigation"
          allIds={[investigation.id]}
          entityId={investigation.id}
        />
      </ActionButtonsContainer>
    </div>
  );
};

const LandingPage = (props: LandingPageProps): React.ReactElement => {
  const [t] = useTranslation();
  const { push } = useHistory();
  const location = useLocation();
  const { view } = React.useMemo(() => parseSearchToQuery(location.search), [
    location.search,
  ]);

  const [value, setValue] = React.useState<'details'>('details');
  const { instrumentId, studyId } = props;

  const pathRoot = 'browseStudyHierarchy';
  const instrumentChild = 'study';
  const urlPrefix = `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${studyId}`;

  const { data } = useStudy(parseInt(studyId));

  const pid = React.useMemo(() => data?.[0]?.pid, [data]);
  const title = React.useMemo(
    () => data?.[0]?.studyInvestigations?.[0]?.investigation?.title,
    [data]
  );
  const summary = React.useMemo(
    () =>
      data?.[0]?.studyInvestigations?.[0]?.investigation?.summary &&
      data[0].studyInvestigations[0].investigation.summary !== 'null'
        ? data[0].studyInvestigations[0].investigation.summary
        : 'Description not provided',
    [data]
  );

  const formattedUsers = React.useMemo(() => {
    const principals: FormattedUser[] = [];
    const contacts: FormattedUser[] = [];
    const experimenters: FormattedUser[] = [];

    if (
      data?.[0]?.studyInvestigations?.[0]?.investigation?.investigationUsers
    ) {
      const investigationUsers = data[0].studyInvestigations[0].investigation
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

  React.useEffect(() => {
    const scriptId = `study-${studyId}`;
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
      description: summary,
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
  }, [t, studyId, formattedUsers, title, summary, pid]);

  const shortInfo = [
    {
      content: function studyPidFormat(entity: Study) {
        return (
          entity?.pid && (
            <MuiLink
              href={`https://doi.org/${entity.pid}`}
              data-testid="landing-study-pid-link"
            >
              {entity.pid}
            </MuiLink>
          )
        );
      },
      label: t('studies.pid'),
      icon: <Public sx={shortInfoIconStyle} />,
    },
    {
      content: (entity: Study) => entity.name,
      label: t('studies.name'),
      icon: <Fingerprint sx={shortInfoIconStyle} />,
    },
    {
      content: function distributionFormat(entity: Study) {
        return (
          <MuiLink href="http://www.isis.stfc.ac.uk/groups/computing/isis-raw-file-format11200.html">
            {t('doi_constants.distribution.format')}
          </MuiLink>
        );
      },
      label: t('studies.details.format'),
      icon: <Storage sx={shortInfoIconStyle} />,
    },
    {
      content: (entity: Study) =>
        entity?.studyInvestigations?.[0]?.investigation?.startDate?.slice(
          0,
          10
        ),
      label: t('studies.start_date'),
      icon: <CalendarToday sx={shortInfoIconStyle} />,
    },
    {
      content: (entity: Study) =>
        entity?.studyInvestigations?.[0]?.investigation?.endDate?.slice(0, 10),
      label: t('studies.end_date'),
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
            >
              <Tab
                id="study-details-tab"
                aria-controls="study-details-panel"
                label={t('studies.details.label')}
                value="details"
              />
              <Tab
                id="study-investigations-tab"
                label={t('studies.details.investigations')}
                onClick={() =>
                  push(
                    view
                      ? `${urlPrefix}/investigation?view=${view}`
                      : `${urlPrefix}/investigation`
                  )
                }
              />
            </Tabs>
            <Divider />
          </Paper>
        </Grid>
        <Grid item container xs={12} id="study-details-panel">
          {/* Long format information */}
          <Grid item xs>
            <Subheading variant="h5" data-testid="landing-investigation-title">
              {title}
            </Subheading>
            <Typography data-testid="landing-study-description">
              {summary}
            </Typography>

            {formattedUsers.length > 0 && (
              <div>
                <Subheading
                  variant="h6"
                  data-testid="landing-study-users-label"
                >
                  {t('studies.details.users')}
                </Subheading>
                {formattedUsers.map((user, i) => (
                  <Typography data-testid={`landing-study-user-${i}`} key={i}>
                    <b>{user.role}:</b> {user.fullName}
                  </Typography>
                ))}
              </div>
            )}

            <Subheading
              variant="h6"
              data-testid="landing-study-publisher-label"
            >
              {t('studies.details.publisher')}
            </Subheading>
            <Typography data-testid="landing-study-publisher">
              {t('doi_constants.publisher.name')}
            </Typography>
            <CitationFormatter
              doi={pid}
              formattedUsers={formattedUsers}
              title={title}
              startDate={
                data?.[0]?.studyInvestigations?.[0]?.investigation?.startDate
              }
            />
          </Grid>

          <Divider orientation="vertical" />
          {/* Short format information */}
          <Grid item xs={6} sm={5} md={4} lg={3} xl={2}>
            {shortInfo.map(
              (field, i) =>
                data?.[0] &&
                field.content(data[0] as Study) && (
                  <ShortInfoRow key={i}>
                    <ShortInfoLabel>
                      {field.icon}
                      {field.label}:
                    </ShortInfoLabel>
                    <ArrowTooltip
                      title={getTooltipText(field.content(data[0] as Study))}
                    >
                      <ShortInfoValue>
                        {field.content(data[0] as Study)}
                      </ShortInfoValue>
                    </ArrowTooltip>
                  </ShortInfoRow>
                )
            )}
            {/* Parts */}
            {data?.map((study, i) => (
              <Box key={i} sx={{ my: 1 }}>
                <Divider />
                {study?.studyInvestigations?.[0]?.investigation && (
                  <LinkedInvestigation
                    investigation={study.studyInvestigations[0].investigation}
                    urlPrefix={urlPrefix}
                    view={view}
                  />
                )}
              </Box>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LandingPage;
