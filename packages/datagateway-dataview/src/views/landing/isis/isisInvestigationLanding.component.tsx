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
  ROLE: string;
  FULLNAME: string;
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

  const title = React.useMemo(() => data[0]?.TITLE, [data]);
  const doi = React.useMemo(() => data[0]?.DOI, [data]);
  const studyInvestigation = React.useMemo(() => data[0]?.STUDYINVESTIGATION, [
    data,
  ]);

  const formattedUsers = React.useMemo(() => {
    const principals: FormattedUser[] = [];
    const contacts: FormattedUser[] = [];
    const experimenters: FormattedUser[] = [];
    if (data[0]?.INVESTIGATIONUSER) {
      const investigationUsers = data[0]
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

  const formattedPublications = React.useMemo(() => {
    if (data[0]?.PUBLICATION) {
      return (data[0].PUBLICATION as Publication[]).map(
        (publication) => publication.FULLREFERENCE
      );
    }
  }, [data]);

  const formattedSamples = React.useMemo(() => {
    if (data[0]?.SAMPLE) {
      return (data[0].SAMPLE as Sample[]).map((sample) => sample.NAME);
    }
  }, [data]);

  const shortInfo = [
    {
      content: (entity: Investigation) => entity.VISIT_ID,
      label: t('investigations.visit_id'),
      icon: <Fingerprint className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Investigation) => entity.DOI,
      label: t('investigations.doi'),
      icon: <Public className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Investigation) => {
        const studyInvestigation = entity.STUDYINVESTIGATION;
        return studyInvestigation
          ? studyInvestigation[0]?.STUDY?.PID
          : undefined;
      },
      label: t('investigations.parent_doi'),
      icon: <Public className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Investigation) => entity.NAME,
      label: t('investigations.name'),
      icon: <Fingerprint className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Investigation) => formatBytes(entity.SIZE),
      label: t('investigations.size'),
      icon: <Save className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Investigation) => entity.FACILITY?.NAME,
      label: t('investigations.details.facility'),
      icon: <Business className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Investigation) =>
        entity.INVESTIGATIONINSTRUMENT?.[0]?.INSTRUMENT?.NAME,
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
      content: (entity: Investigation) => entity.RELEASEDATE?.slice(0, 10),
      label: t('investigations.release_date'),
      icon: <CalendarToday className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Investigation) => entity.STARTDATE?.slice(0, 10),
      label: t('investigations.start_date'),
      icon: <CalendarToday className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Investigation) => entity.ENDDATE?.slice(0, 10),
      label: t('investigations.end_date'),
      icon: <CalendarToday className={classes.shortInfoIcon} />,
    },
  ];

  const shortDatasetInfo = [
    {
      content: (entity: Dataset) => entity.DOI,
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
              {data[0]?.TITLE}
            </Typography>

            <Typography aria-label="landing-investigation-summary">
              {data[0]?.SUMMARY}
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
                    <b>{user.ROLE}:</b> {user.FULLNAME}
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
                  `${formattedUsers[0].FULLNAME} et al; `}
                {formattedUsers.length === 1 &&
                  `${formattedUsers[0].FULLNAME}; `}
                {studyInvestigation &&
                  studyInvestigation[0]?.STUDY?.STARTDATE &&
                  `${studyInvestigation[0].STUDY.STARTDATE.slice(0, 4)}: `}
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
            {(data[0] as Investigation)?.DATASET?.map((dataset, i) => (
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
                    `${urlPrefix}/dataset/${dataset.ID}`,
                    `${t('datasets.dataset')}: ${dataset.NAME}`,
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
                    allIds={[dataset.ID]}
                    entityId={dataset.ID}
                  />
                  <DownloadButton
                    entityType="dataset"
                    entityId={dataset.ID}
                    entityName={dataset.NAME}
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
                ID: { eq: investigationId },
              }),
            },
            {
              filterType: 'include',
              filterValue: JSON.stringify([
                'INVESTIGATIONUSER',
                'SAMPLE',
                'PUBLICATION',
                'DATASET',
                // STUDY and INSTRUMENT already fetched by default
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
              ID: { eq: investigationId },
              'STUDYINVESTIGATION.STUDY.ID': { eq: studyId },
            }),
          },
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              ID: { eq: investigationId },
              'INVESTIGATIONINSTRUMENT.INSTRUMENT.ID': { eq: instrumentId },
            }),
          },
          {
            filterType: 'include',
            filterValue: JSON.stringify([
              'INVESTIGATIONUSER',
              'SAMPLE',
              'PUBLICATION',
              'DATASET',
              {
                STUDYINVESTIGATION: 'STUDY',
              },
              {
                INVESTIGATIONINSTRUMENT: 'INSTRUMENT',
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
