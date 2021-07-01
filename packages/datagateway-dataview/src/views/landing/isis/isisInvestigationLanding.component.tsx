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
  Business,
  CalendarToday,
  Fingerprint,
  Public,
  Save,
  Storage,
} from '@material-ui/icons';
import { push } from 'connected-react-router';
import {
  Dataset,
  Entity,
  fetchInvestigations,
  fetchISISInvestigations,
  formatBytes,
  Investigation,
  InvestigationUser,
  Publication,
  Sample,
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
import DownloadButton from '../../downloadButton.component';
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
  role: string;
  fullName: string;
}

interface LandingPageDispatchProps {
  fetchFacilityCycleData: (
    instrumentId: number,
    FacilityCycleId: number,
    investigationId: number
  ) => Promise<void>;
  fetchStudyData: (
    instrumentId: number,
    StudyId: number,
    investigationId: number
  ) => Promise<void>;
  viewDatasets: (urlPrefix: string, view: ViewsType) => Action;
}

interface LandingPageStateProps {
  data: Entity[];
  view: ViewsType;
}

interface LandingPageProps {
  instrumentId: string;
  instrumentChildId: string;
  investigationId: string;
  studyHierarchy: boolean;
}

type LandingPageCombinedProps = LandingPageDispatchProps &
  LandingPageStateProps &
  LandingPageProps;

const LandingPage = (props: LandingPageCombinedProps): React.ReactElement => {
  const [t] = useTranslation();
  const [value, setValue] = React.useState<'details'>('details');
  const {
    fetchFacilityCycleData,
    fetchStudyData,
    viewDatasets,
    data,
    view,
    instrumentId,
    instrumentChildId,
    investigationId,
    studyHierarchy,
  } = props;

  const pathRoot = studyHierarchy ? 'browseStudyHierarchy' : 'browse';
  const instrumentChild = studyHierarchy ? 'study' : 'facilityCycle';
  const urlPrefix = `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${instrumentChildId}/investigation/${investigationId}`;
  const classes = useStyles();

  const fetchData = studyHierarchy ? fetchStudyData : fetchFacilityCycleData;
  React.useEffect(() => {
    fetchData(
      parseInt(instrumentId),
      parseInt(instrumentChildId),
      parseInt(investigationId)
    );
  }, [fetchData, instrumentId, instrumentChildId, investigationId]);

  const title = React.useMemo(() => data[0]?.title, [data]);
  const doi = React.useMemo(() => data[0]?.doi, [data]);
  const studyInvestigation = React.useMemo(() => data[0]?.studyInvestigations, [
    data,
  ]);

  const formattedUsers = React.useMemo(() => {
    const principals: FormattedUser[] = [];
    const contacts: FormattedUser[] = [];
    const experimenters: FormattedUser[] = [];
    if (data[0]?.investigationUsers) {
      const investigationUsers = data[0]
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
    if (data[0]?.publications) {
      return (data[0].publications as Publication[]).map(
        (publication) => publication.fullReference
      );
    }
  }, [data]);

  const formattedSamples = React.useMemo(() => {
    if (data[0]?.samples) {
      return (data[0].samples as Sample[]).map((sample) => sample.name);
    }
  }, [data]);

  const shortInfo = [
    {
      content: (entity: Investigation) => entity.visitId,
      label: t('investigations.visit_id'),
      icon: <Fingerprint className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Investigation) => entity.doi,
      label: t('investigations.doi'),
      icon: <Public className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Investigation) => {
        const studyInvestigation = entity.studyInvestigations;
        return studyInvestigation
          ? studyInvestigation[0]?.study?.pid
          : undefined;
      },
      label: t('investigations.parent_doi'),
      icon: <Public className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Investigation) => entity.name,
      label: t('investigations.name'),
      icon: <Fingerprint className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Investigation) => formatBytes(entity.size),
      label: t('investigations.size'),
      icon: <Save className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Investigation) => entity.facility?.name,
      label: t('investigations.details.facility'),
      icon: <Business className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Investigation) =>
        entity.investigationInstruments?.[0]?.instrument?.name,
      label: t('investigations.instrument'),
      icon: <Assessment className={classes.shortInfoIcon} />,
    },
    {
      content: function distributionFormat(entity: Investigation) {
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
      content: (entity: Investigation) => entity.releaseDate?.slice(0, 10),
      label: t('investigations.release_date'),
      icon: <CalendarToday className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Investigation) => entity.startDate?.slice(0, 10),
      label: t('investigations.start_date'),
      icon: <CalendarToday className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Investigation) => entity.endDate?.slice(0, 10),
      label: t('investigations.end_date'),
      icon: <CalendarToday className={classes.shortInfoIcon} />,
    },
  ];

  const shortDatasetInfo = [
    {
      content: (entity: Dataset) => entity.doi,
      label: t('datasets.doi'),
      icon: <Public className={classes.shortInfoIcon} />,
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
                id="investigation-details-tab"
                aria-controls="investigation-details-panel"
                label={t('investigations.details.label')}
                value="details"
              />
              <Tab
                id="investigation-datasets-tab"
                label={t('investigations.details.datasets')}
                onClick={() => viewDatasets(urlPrefix, view)}
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
              {data[0]?.title}
            </Typography>

            <Typography aria-label="landing-investigation-summary">
              {data[0]?.summary}
            </Typography>

            {formattedUsers.length > 0 && (
              <div>
                <Typography
                  className={classes.subHeading}
                  component="h6"
                  variant="h6"
                  aria-label="landing-investigation-users-label"
                >
                  {t('investigations.details.users.label')}
                </Typography>
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

            <Typography
              className={classes.subHeading}
              component="h6"
              variant="h6"
              aria-label="landing-investigation-publisher-label"
            >
              {t('studies.details.publisher')}
            </Typography>
            <Typography aria-label="landing-investigation-publisher">
              {t('doi_constants.publisher.name')}
            </Typography>

            <Typography
              className={classes.subHeading}
              component="h6"
              variant="h6"
              aria-label="landing-investigation-citation-label"
            >
              {t('studies.details.citation_label')}
            </Typography>
            <Typography aria-label="landing-investigation-citation_format">
              {t('studies.details.citation_format')}
            </Typography>
            <Typography aria-label="landing-investigation-citation">
              <i>
                {formattedUsers.length > 1 &&
                  `${formattedUsers[0].fullName} et al; `}
                {formattedUsers.length === 1 &&
                  `${formattedUsers[0].fullName}; `}
                {studyInvestigation &&
                  studyInvestigation[0]?.study?.startDate &&
                  `${studyInvestigation[0].study.startDate.slice(0, 4)}: `}
                {title && `${title}, `}
                {t('doi_constants.publisher.name')}
                {doi && `, https://doi.org/${doi}`}
              </i>
            </Typography>

            {formattedSamples && (
              <div>
                <Typography
                  className={classes.subHeading}
                  component="h6"
                  variant="h6"
                  aria-label="landing-investigation-samples-label"
                >
                  {t('investigations.details.samples.label')}
                </Typography>
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
                <Typography
                  className={classes.subHeading}
                  component="h6"
                  variant="h6"
                  aria-label="landing-investigation-publications-label"
                >
                  {t('investigations.details.publications.label')}
                </Typography>
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
                data[0] &&
                field.content(data[0] as Investigation) && (
                  <div className={classes.shortInfoRow} key={i}>
                    <Typography className={classes.shortInfoLabel}>
                      {field.icon}
                      {field.label}:
                    </Typography>
                    <Typography className={classes.shortInfoValue}>
                      {field.content(data[0] as Investigation)}
                    </Typography>
                  </div>
                )
            )}
            {/* Actions */}
            <div className={classes.actionButtons}>
              <AddToCartButton
                entityType="investigation"
                allIds={[parseInt(investigationId)]}
                entityId={parseInt(investigationId)}
              />
            </div>
            {/* Parts */}
            {(data[0] as Investigation)?.datasets?.map((dataset, i) => (
              <div key={i} className={classes.shortInfoPart}>
                <Divider />
                <Typography
                  className={classes.subHeading}
                  component="h6"
                  variant="h6"
                  align="center"
                  aria-label="landing-investigation-part-label"
                >
                  {tableLink(
                    `${urlPrefix}/dataset/${dataset.id}`,
                    `${t('datasets.name')}: ${dataset.name}`,
                    view
                  )}
                </Typography>
                {shortDatasetInfo.map(
                  (field, i) =>
                    field.content(dataset as Dataset) && (
                      <div className={classes.shortInfoRow} key={i}>
                        <Typography className={classes.shortInfoLabel}>
                          {field.icon}
                          {field.label}:
                        </Typography>
                        <Typography className={classes.shortInfoValue}>
                          {field.content(dataset as Dataset)}
                        </Typography>
                      </div>
                    )
                )}
                <div className={classes.actionButtons}>
                  <AddToCartButton
                    entityType="investigation"
                    allIds={[dataset.id]}
                    entityId={dataset.id}
                  />
                  <DownloadButton
                    entityType="dataset"
                    entityId={dataset.id}
                    entityName={dataset.name}
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
  fetchFacilityCycleData: (
    instrumentId: number,
    facilityCycleId: number,
    investigationId: number
  ) =>
    dispatch(
      fetchISISInvestigations({
        instrumentId,
        facilityCycleId,
        optionalParams: {
          getSize: true,
          additionalFilters: [
            {
              filterType: 'where',
              filterValue: JSON.stringify({
                id: { eq: investigationId },
              }),
            },
            {
              filterType: 'include',
              filterValue: JSON.stringify([
                'investigationUsers',
                'samples',
                'publications',
                'datasets',
                // study and instrument already fetched by default
              ]),
            },
          ],
        },
      })
    ),
  fetchStudyData: (
    instrumentId: number,
    studyId: number,
    investigationId: number
  ) =>
    dispatch(
      fetchInvestigations({
        getSize: true,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              id: { eq: investigationId },
              'studyInvestigations.study.id': { eq: studyId },
            }),
          },
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              id: { eq: investigationId },
              'investigationInstruments.instrument.id': { eq: instrumentId },
            }),
          },
          {
            filterType: 'include',
            filterValue: JSON.stringify([
              'investigationUsers',
              'samples',
              'publications',
              'datasets',
              {
                studyInvestigations: 'study',
              },
              {
                investigationInstruments: 'instrument',
              },
            ]),
          },
        ],
      })
    ),
  viewDatasets: (urlPrefix: string, view: ViewsType) => {
    const url = view
      ? `${urlPrefix}/dataset?view=${view}`
      : `${urlPrefix}/dataset`;
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
