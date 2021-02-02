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
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import AddToCartButton from '../../addToCartButton.component';
import Branding from './isisBranding.component';

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
  ROLE: string;
  FULLNAME: string;
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

  const pid = React.useMemo(() => data[0]?.STUDY?.PID, [data]);
  const title = React.useMemo(() => data[0]?.INVESTIGATION?.TITLE, [data]);
  const summary = React.useMemo(() => data[0]?.INVESTIGATION?.SUMMARY, [data]);

  const formattedUsers = React.useMemo(() => {
    const principals: FormattedUser[] = [];
    const contacts: FormattedUser[] = [];
    const experimenters: FormattedUser[] = [];
    if (data[0]?.INVESTIGATION?.INVESTIGATIONUSER) {
      const investigationUsers = data[0].INVESTIGATION
        .INVESTIGATIONUSER as InvestigationUser[];
      investigationUsers.forEach((user) => {
        // Only keep users where we have their FULLNAME
        const fullname = user.USER_?.FULLNAME;
        if (fullname) {
          switch (user.ROLE) {
            case 'principal_experimenter':
              principals.push({
                FULLNAME: fullname,
                ROLE: 'Principal Investigator',
              });
              break;
            case 'local_contact':
              contacts.push({ FULLNAME: fullname, ROLE: 'Local Contact' });
              break;
            default:
              experimenters.push({ FULLNAME: fullname, ROLE: 'Experimenter' });
          }
        }
      });
    }
    // Ensure PIs are listed first, and sort within roles for consistency
    principals.sort((a, b) => a.FULLNAME.localeCompare(b.FULLNAME));
    contacts.sort((a, b) => a.FULLNAME.localeCompare(b.FULLNAME));
    experimenters.sort((a, b) => a.FULLNAME.localeCompare(b.FULLNAME));
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
        return { '@type': 'Person', name: user.FULLNAME };
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
      content: (entity: StudyInvestigation) => entity.STUDY?.PID,
      label: t('studies.pid'),
      icon: <Public className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: StudyInvestigation) => entity.STUDY?.NAME,
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
        entity.STUDY?.STARTDATE?.slice(0, 10),
      label: t('studies.start_date'),
      icon: <CalendarToday className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: StudyInvestigation) =>
        entity.STUDY?.ENDDATE?.slice(0, 10),
      label: t('studies.end_date'),
      icon: <CalendarToday className={classes.shortInfoIcon} />,
    },
  ];

  const shortInvestigationInfo = [
    {
      content: (entity: Investigation) => entity.DOI,
      label: t('investigations.doi'),
      icon: <Public className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Investigation) =>
        entity.INVESTIGATIONINSTRUMENT?.[0]?.INSTRUMENT?.NAME,
      label: t('investigations.instrument'),
      icon: <Assessment className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Investigation) => entity.RELEASEDATE?.slice(0, 10),
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
                    <b>{user.ROLE}:</b> {user.FULLNAME}
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
              <i>
                {formattedUsers.length > 1 &&
                  `${formattedUsers[0].FULLNAME} et al; `}
                {formattedUsers.length === 1 &&
                  `${formattedUsers[0].FULLNAME}; `}
                {data[0]?.STUDY?.STARTDATE &&
                  `${data[0].STUDY.STARTDATE.slice(0, 4)}: `}
                {title && `${title}, `}
                {t('doi_constants.publisher.name')}
                {pid && `, https://doi.org/${pid}`}
              </i>
            </Typography>
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
                    `${urlPrefix}/investigation/${studyInvestigation.INVESTIGATION_ID}`,
                    `${t('investigations.visit_id')}: ${
                      studyInvestigation.INVESTIGATION?.VISIT_ID
                    }`,
                    view
                  )}
                </Typography>
                {shortInvestigationInfo.map(
                  (field, i) =>
                    data[0]?.INVESTIGATION &&
                    field.content(data[0].INVESTIGATION as Investigation) && (
                      <div className={classes.shortInfoRow} key={i}>
                        <Typography className={classes.shortInfoLabel}>
                          {field.icon}
                          {field.label}:
                        </Typography>
                        <Typography className={classes.shortInfoValue}>
                          {field.content(
                            studyInvestigation.INVESTIGATION as Investigation
                          )}
                        </Typography>
                      </div>
                    )
                )}
                <div className={classes.actionButtons}>
                  <AddToCartButton
                    entityType="investigation"
                    allIds={[parseInt(studyInvestigation.INVESTIGATION_ID)]}
                    entityId={parseInt(studyInvestigation.INVESTIGATION_ID)}
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
              'STUDY.ID': { eq: studyId },
            }),
          },
          {
            filterType: 'include',
            filterValue: JSON.stringify([
              'STUDY',
              {
                INVESTIGATION: [
                  { INVESTIGATIONUSER: 'USER_' },
                  { INVESTIGATIONINSTRUMENT: 'INSTRUMENT' },
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
