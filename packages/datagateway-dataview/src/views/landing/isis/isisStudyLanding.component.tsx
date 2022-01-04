import {
  createStyles,
  Divider,
  Grid,
  Link as MuiLink,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Theme,
  Typography,
} from '@material-ui/core';
import {
  Assessment,
  CalendarToday,
  Fingerprint,
  Public,
  Storage,
} from '@material-ui/icons';
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
import { useHistory, useLocation } from 'react-router';
import Branding from './isisBranding.component';
import CitationFormatter from '../../citationFormatter.component';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      margin: theme.spacing(1),
      padding: theme.spacing(1),
    },
    tabPaper: {
      marginLeft: -theme.spacing(1.5),
      marginRight: -theme.spacing(1.5),
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5),
    },
    subHeading: {
      marginTop: theme.spacing(1),
    },
    shortInfoRow: {
      display: 'flex',
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    shortInfoIcon: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    shortInfoLabel: {
      display: 'flex',
      width: '50%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    shortInfoValue: {
      width: '50%',
      textAlign: 'right',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    shortInfoPart: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    actionButtons: {
      display: 'flex',
      flexDirection: 'column',
      '& button': {
        marginTop: theme.spacing(1),
        margin: 'auto',
      },
    },
  })
);

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
  const classes = useStyles();

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
      icon: <Public className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Investigation) =>
        entity.investigationInstruments?.[0]?.instrument?.name,
      label: t('investigations.instrument'),
      icon: <Assessment className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Investigation) => entity.releaseDate?.slice(0, 10),
      label: t('investigations.release_date'),
      icon: <CalendarToday className={classes.shortInfoIcon} />,
    },
  ];

  return (
    <div>
      <Typography
        className={classes.subHeading}
        component="h6"
        variant="h6"
        align="center"
        data-testid="landing-study-part-label"
      >
        {tableLink(
          `${props.urlPrefix}/investigation/${investigation.id}`,
          `${t('investigations.visit_id')}: ${investigation.visitId}`,
          props.view
        )}
      </Typography>
      {shortInvestigationInfo.map((field, i) => (
        <div className={classes.shortInfoRow} key={i}>
          <Typography className={classes.shortInfoLabel}>
            {field.icon}
            {field.label}:
          </Typography>
          <Typography className={classes.shortInfoValue}>
            {field.content(investigation)}
          </Typography>
        </div>
      ))}
      <div className={classes.actionButtons}>
        <AddToCartButton
          entityType="investigation"
          allIds={[investigation.id]}
          entityId={investigation.id}
        />
      </div>
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
  const classes = useStyles();

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
      icon: <Public className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Study) => entity.name,
      label: t('studies.name'),
      icon: <Fingerprint className={classes.shortInfoIcon} />,
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
      icon: <Storage className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Study) =>
        entity?.studyInvestigations?.[0]?.investigation?.startDate?.slice(
          0,
          10
        ),
      label: t('studies.start_date'),
      icon: <CalendarToday className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Study) =>
        entity?.studyInvestigations?.[0]?.investigation?.endDate?.slice(0, 10),
      label: t('studies.end_date'),
      icon: <CalendarToday className={classes.shortInfoIcon} />,
    },
  ];

  return (
    <Paper className={classes.paper}>
      <Grid container style={{ padding: 4 }}>
        <Grid item xs={12}>
          <Branding />
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.tabPaper} square elevation={0}>
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
            <Typography
              className={classes.subHeading}
              component="h5"
              variant="h5"
              data-testid="landing-investigation-title"
            >
              {title}
            </Typography>
            <Typography data-testid="landing-study-description">
              {summary}
            </Typography>

            {formattedUsers.length > 0 && (
              <div>
                <Typography
                  className={classes.subHeading}
                  component="h6"
                  variant="h6"
                  data-testid="landing-study-users-label"
                >
                  {t('studies.details.users')}
                </Typography>
                {formattedUsers.map((user, i) => (
                  <Typography data-testid={`landing-study-user-${i}`} key={i}>
                    <b>{user.role}:</b> {user.fullName}
                  </Typography>
                ))}
              </div>
            )}

            <Typography
              className={classes.subHeading}
              component="h6"
              variant="h6"
              data-testid="landing-study-publisher-label"
            >
              {t('studies.details.publisher')}
            </Typography>
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
                  <div className={classes.shortInfoRow} key={i}>
                    <Typography className={classes.shortInfoLabel}>
                      {field.icon}
                      {field.label}:
                    </Typography>
                    <ArrowTooltip
                      title={getTooltipText(field.content(data[0] as Study))}
                    >
                      <Typography className={classes.shortInfoValue}>
                        {field.content(data[0] as Study)}
                      </Typography>
                    </ArrowTooltip>
                  </div>
                )
            )}
            {/* Parts */}
            {data?.map((study, i) => (
              <div key={i} className={classes.shortInfoPart}>
                <Divider />
                {study?.studyInvestigations?.[0]?.investigation && (
                  <LinkedInvestigation
                    investigation={study.studyInvestigations[0].investigation}
                    urlPrefix={urlPrefix}
                    view={view}
                  />
                )}
              </div>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LandingPage;
