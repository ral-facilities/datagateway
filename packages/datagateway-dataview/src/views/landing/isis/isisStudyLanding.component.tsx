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
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import AddToCartButton from '../../addToCartButton.component';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      margin: theme.spacing(1),
      padding: theme.spacing(1),
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

interface LandingPageDispatchProps {
  // fetchDetails: (investigationId: number) => Promise<void>;
  fetchStudyData: (studyId: number) => Promise<void>;
  viewAllInvestigations: (urlPrefix: string) => Action;
}

interface LandingPageStateProps {
  data: Entity[];
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
    const users: InvestigationUser[] = [];
    if (data[0]?.INVESTIGATION?.INVESTIGATIONUSER) {
      (data[0].INVESTIGATION.INVESTIGATIONUSER as InvestigationUser[])
        .filter((user) => user.USER_?.FULLNAME)
        .forEach((user) => {
          switch (user.ROLE) {
            case 'principal_experimenter':
              users.unshift({ ...user, ROLE: 'Principal Investigator' });
              break;
            case 'local_contact':
              users.push({ ...user, ROLE: 'Local Contact' });
              break;
            default:
              users.push({ ...user, ROLE: 'Experimenter' });
          }
        });
    }
    return users;
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
        return { '@type': 'Person', name: user.USER_?.FULLNAME };
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
      label: t('studies.doi'),
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
        {/* <Grid item xs={12}> 
          BRANDING PLACEHOLDER
          <Divider />
        </Grid> */}
        <Grid item xs={12}>
          <Typography
            component="h5"
            variant="h5"
            aria-label="landing-investigation-title"
          >
            {title}
          </Typography>
        </Grid>
        <Grid item xs={12}>
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
              onClick={() => viewAllInvestigations(urlPrefix)}
            />
          </Tabs>
          <Divider />
        </Grid>
        <Grid item container xs={12}>
          {/* Long format information */}
          <Grid item xs>
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
                {formattedUsers.map(
                  (user, i) =>
                    user.USER_?.FULLNAME && (
                      <Typography
                        aria-label={`landing-study-user-${i}`}
                        key={user.USER_.ID}
                      >
                        <b>{user.ROLE}:</b> {user.USER_.FULLNAME}
                      </Typography>
                    )
                )}
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
              {formattedUsers.length > 1 &&
                `${formattedUsers[0].USER_?.FULLNAME} et al; `}
              {formattedUsers.length === 1 &&
                `${formattedUsers[0].USER_?.FULLNAME}; `}
              {data[0]?.STUDY?.STARTDATE &&
                `${data[0].STUDY.STARTDATE.slice(0, 4)}: `}
              {title && `${title}, `}
              {t('doi_constants.publisher.name')}
              {pid && `, https://doi.org/${pid}`}
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
              <div key={i}>
                <Divider />
                <Typography
                  component="h6"
                  variant="h6"
                  align="center"
                  aria-label="landing-study-part-label"
                >
                  <Link
                    to={`${urlPrefix}/investigation/${studyInvestigation.INVESTIGATION_ID}`}
                  >
                    {`${t('studies.details.part')} ${i + 1}:`}
                  </Link>
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
                            data[0].INVESTIGATION as Investigation
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
                INVESTIGATION: {
                  INVESTIGATIONUSER: 'USER_',
                  INVESTIGATIONINSTRUMENT: 'INSTRUMENT',
                },
              },
            ]),
          },
        ],
      })
    ),
  viewAllInvestigations: (urlPrefix: string) =>
    dispatch(push(`${urlPrefix}/investigation`)),
});

const mapStateToProps = (state: StateType): LandingPageStateProps => {
  return {
    data: state.dgcommon.data,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LandingPage);
