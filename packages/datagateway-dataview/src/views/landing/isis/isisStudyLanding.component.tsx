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
import { push } from 'connected-react-router';
import {
  Entity,
  fetchStudies,
  Investigation,
  InvestigationUser,
  StudyInvestigation,
  tableLink,
  ViewsType,
  Mark,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import AddToCartButton from '../../addToCartButton.component';
import Branding from './isisBranding.component';
import Button from '@material-ui/core/Button';

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

interface FormattedUser {
  role: string;
  fullName: string;
}

interface LandingPageDispatchProps {
  fetchStudyData: (studyId: number) => Promise<void>;
  viewAllInvestigations: (urlPrefix: string, view: ViewsType) => Action;
}

interface LandingPageStateProps {
  data: Entity[];
  view: ViewsType;
}

interface LandingPageProps {
  instrumentId: string;
  studyId: string;
}

type LandingPageCombinedProps = LandingPageDispatchProps &
  LandingPageStateProps &
  LandingPageProps;

const LandingPage = (props: LandingPageCombinedProps): React.ReactElement => {
  const [t] = useTranslation();
  const [value, setValue] = React.useState<'details'>('details');
  const citationRef = React.useRef<HTMLElement>(null);
  const [copiedCitation, setCopiedCitation] = React.useState(false);
  const {
    fetchStudyData,
    viewAllInvestigations,
    data,
    view,
    instrumentId,
    studyId,
  } = props;

  const pathRoot = 'browseStudyHierarchy';
  const instrumentChild = 'study';
  const urlPrefix = `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${studyId}`;
  const classes = useStyles();

  const pid = React.useMemo(() => data[0]?.study?.pid, [data]);
  const title = React.useMemo(() => data[0]?.investigation?.title, [data]);
  const summary = React.useMemo(() => data[0]?.investigation?.summary, [data]);

  const formattedUsers = React.useMemo(() => {
    const principals: FormattedUser[] = [];
    const contacts: FormattedUser[] = [];
    const experimenters: FormattedUser[] = [];
    if (data[0]?.investigation?.investigationUsers) {
      const investigationUsers = data[0].investigation
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
    fetchStudyData(parseInt(studyId));
  }, [fetchStudyData, studyId]);

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
      content: (entity: StudyInvestigation) => entity.study?.pid,
      label: t('studies.pid'),
      icon: <Public className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: StudyInvestigation) => entity.study?.name,
      label: t('studies.name'),
      icon: <Fingerprint className={classes.shortInfoIcon} />,
    },
    {
      content: function distributionFormat(entity: StudyInvestigation) {
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
      content: (entity: StudyInvestigation) =>
        entity.study?.startDate?.slice(0, 10),
      label: t('studies.start_date'),
      icon: <CalendarToday className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: StudyInvestigation) =>
        entity.study?.endDate?.slice(0, 10),
      label: t('studies.end_date'),
      icon: <CalendarToday className={classes.shortInfoIcon} />,
    },
  ];

  const shortInvestigationInfo = [
    {
      content: (entity: Investigation) => entity.doi,
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
                onClick={() => viewAllInvestigations(urlPrefix, view)}
              />
            </Tabs>
            <Divider />
          </Paper>
        </Grid>
        <Grid item container xs={12}>
          {/* Long format information */}
          <Grid item xs>
            <Typography
              className={classes.subHeading}
              component="h5"
              variant="h5"
              aria-label="landing-investigation-title"
            >
              {title}
            </Typography>
            <Typography aria-label="landing-study-description">
              {summary}
            </Typography>

            {formattedUsers.length > 0 && (
              <div>
                <Typography
                  className={classes.subHeading}
                  component="h6"
                  variant="h6"
                  aria-label="landing-study-users-label"
                >
                  {t('studies.details.users')}
                </Typography>
                {formattedUsers.map((user, i) => (
                  <Typography aria-label={`landing-study-user-${i}`} key={i}>
                    <b>{user.role}:</b> {user.fullName}
                  </Typography>
                ))}
              </div>
            )}

            <Typography
              className={classes.subHeading}
              component="h6"
              variant="h6"
              aria-label="landing-study-publisher-label"
            >
              {t('studies.details.publisher')}
            </Typography>
            <Typography aria-label="landing-study-publisher">
              {t('doi_constants.publisher.name')}
            </Typography>

            <Typography
              className={classes.subHeading}
              component="h6"
              variant="h6"
              aria-label="landing-study-citation-label"
            >
              {t('studies.details.citation_label')}
            </Typography>
            <Typography aria-label="landing-study-citation_format">
              {t('studies.details.citation_format')}
            </Typography>
            <Typography aria-label="landing-study-citation">
              <i ref={citationRef}>
                {formattedUsers.length > 1 &&
                  `${formattedUsers[0].fullName} et al; `}
                {formattedUsers.length === 1 &&
                  `${formattedUsers[0].fullName}; `}
                {data[0]?.study?.startDate &&
                  `${data[0].study.startDate.slice(0, 4)}: `}
                {title && `${title}, `}
                {t('doi_constants.publisher.name')}
                {pid && ', '}
                {pid && (
                  <a
                    href={`https://doi.org/${pid}`}
                  >{`https://doi.org/${pid}`}</a>
                )}
              </i>
            </Typography>
            {!copiedCitation ? (
              <Button
                id="landing-study-copy-citation"
                aria-label="landing-study-copy-citation"
                variant="contained"
                color="primary"
                size="small"
                onClick={() => {
                  if (citationRef && citationRef.current)
                    navigator.clipboard.writeText(
                      citationRef.current.innerText
                    );
                  setCopiedCitation(true);
                  setTimeout(() => setCopiedCitation(false), 1750);
                }}
              >
                Copy citation
              </Button>
            ) : (
              <Button
                id="landing-study-copied-citation"
                variant="contained"
                color="primary"
                size="small"
                startIcon={<Mark size={20} visible={true} />}
              >
                Copied citation
              </Button>
            )}
          </Grid>

          <Divider orientation="vertical" />
          {/* Short format information */}
          <Grid item xs={6} sm={5} md={4} lg={3} xl={2}>
            {shortInfo.map(
              (field, i) =>
                data[0] &&
                field.content(data[0] as StudyInvestigation) && (
                  <div className={classes.shortInfoRow} key={i}>
                    <Typography className={classes.shortInfoLabel}>
                      {field.icon}
                      {field.label}:
                    </Typography>
                    <Typography className={classes.shortInfoValue}>
                      {field.content(data[0] as StudyInvestigation)}
                    </Typography>
                  </div>
                )
            )}
            {/* Parts */}
            {data.map((studyInvestigation, i) => (
              <div key={i} className={classes.shortInfoPart}>
                <Divider />
                <Typography
                  className={classes.subHeading}
                  component="h6"
                  variant="h6"
                  align="center"
                  aria-label="landing-study-part-label"
                >
                  {tableLink(
                    `${urlPrefix}/investigation/${studyInvestigation.investigation.id}`,
                    `${t('investigations.visit_id')}: ${
                      studyInvestigation.investigation?.visitId
                    }`,
                    view
                  )}
                </Typography>
                {shortInvestigationInfo.map(
                  (field, i) =>
                    data[0]?.investigation &&
                    field.content(data[0].investigation as Investigation) && (
                      <div className={classes.shortInfoRow} key={i}>
                        <Typography className={classes.shortInfoLabel}>
                          {field.icon}
                          {field.label}:
                        </Typography>
                        <Typography className={classes.shortInfoValue}>
                          {field.content(
                            studyInvestigation.investigation as Investigation
                          )}
                        </Typography>
                      </div>
                    )
                )}
                <div className={classes.actionButtons}>
                  <AddToCartButton
                    entityType="investigation"
                    allIds={[parseInt(studyInvestigation.investigation.id)]}
                    entityId={parseInt(studyInvestigation.investigation.id)}
                  />
                </div>
              </div>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): LandingPageDispatchProps => ({
  fetchStudyData: (studyId: number) =>
    dispatch(
      fetchStudies({
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              'study.id': { eq: studyId },
            }),
          },
          {
            filterType: 'include',
            filterValue: JSON.stringify([
              'study',
              {
                investigation: [
                  { investigationUsers: 'user' },
                  { investigationInstruments: 'instrument' },
                ],
              },
            ]),
          },
        ],
      })
    ),
  viewAllInvestigations: (urlPrefix: string, view: ViewsType) => {
    const url = view
      ? `${urlPrefix}/investigation?view=${view}`
      : `${urlPrefix}/investigation`;
    return dispatch(push(url));
  },
});

const mapStateToProps = (state: StateType): LandingPageStateProps => {
  return {
    data: state.dgcommon.data,
    view: state.dgcommon.query.view,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LandingPage);
