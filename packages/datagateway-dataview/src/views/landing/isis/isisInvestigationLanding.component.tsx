import {
  createStyles,
  Divider,
  Grid,
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
  PieChart,
  Public,
  Save,
} from '@material-ui/icons';
import { push } from 'connected-react-router';
import {
  Entity,
  fetchInvestigationDetails,
  fetchISISInvestigations,
  formatBytes,
  Investigation,
  InvestigationUser,
  Publication,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
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
    actionButton: {
      display: 'flex',
      marginTop: theme.spacing(1),
    },
  })
);

interface LandingPageDispatchProps {
  fetchDetails: (investigationId: number) => Promise<void>;
  fetchData: (
    instrumentId: number,
    facilityCycleId: number,
    investigationId: number
  ) => Promise<void>;
  viewDatasets: (urlPrefix: string) => Action;
}

interface LandingPageStateProps {
  data: Entity[];
}

interface LandingPageProps {
  instrumentId: string;
  facilityCycleId: string;
  investigationId: string;
}

type LandingPageCombinedProps = LandingPageDispatchProps &
  LandingPageStateProps &
  LandingPageProps;

const LandingPage = (props: LandingPageCombinedProps): React.ReactElement => {
  const [t] = useTranslation();
  const [value, setValue] = React.useState<'details'>('details');
  const {
    fetchDetails,
    fetchData,
    viewDatasets,
    data,
    instrumentId,
    facilityCycleId,
    investigationId,
  } = props;
  const urlPrefix = `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${investigationId}`;
  const classes = useStyles();

  React.useEffect(() => {
    fetchData(
      parseInt(instrumentId),
      parseInt(facilityCycleId),
      parseInt(investigationId)
    );
  }, [fetchData, instrumentId, facilityCycleId, investigationId]);

  React.useEffect(() => {
    if (
      data[0] &&
      (!data[0]?.INVESTIGATIONUSER || !data[0]?.SAMPLE || !data[0]?.PUBLICATION)
    ) {
      fetchDetails(data[0].ID);
    }
  }, [fetchDetails, data]);

  const filteredUsers = React.useMemo(() => {
    if (data[0] && data[0]?.INVESTIGATIONUSER) {
      return (data[0].INVESTIGATIONUSER as InvestigationUser[]).filter(
        (user) => user.USER_?.FULLNAME
      );
    }
  }, [data]);

  const filteredPublications = React.useMemo(() => {
    if (data[0] && data[0]?.PUBLICATION) {
      return (data[0].PUBLICATION as Publication[]).map(
        (publication) => publication.FULLREFERENCE
      );
    }
  }, [data]);

  const shortInfo = [
    {
      content: (entity: Investigation) => entity.VISIT_ID,
      label: t('investigations.rb_number'),
      icon: <Fingerprint className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Investigation) => entity.DOI,
      label: t('investigations.doi'),
      icon: <Public className={classes.shortInfoIcon} />,
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
      content: (entity: Investigation) => entity.SAMPLE?.[0]?.NAME,
      label: t('investigations.details.samples.name'),
      icon: <PieChart className={classes.shortInfoIcon} />,
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
            {data[0]?.TITLE}
          </Typography>
        </Grid>
        <Grid item xs={12}>
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
              onClick={() => viewDatasets(urlPrefix)}
            />
          </Tabs>
          <Divider />
        </Grid>
        <Grid item container xs={12}>
          {/* Long format information */}
          <Grid item xs>
            <Typography
              className={classes.subHeading}
              component="h6"
              variant="h6"
              aria-label="landing-investigation-name"
            >
              {data[0]?.NAME}
            </Typography>
            <Typography aria-label="landing-investigation-summary">
              {data[0]?.SUMMARY}
            </Typography>
            {filteredUsers && (
              <div>
                <Typography
                  className={classes.subHeading}
                  component="h6"
                  variant="h6"
                  aria-label="landing-investigation-users-label"
                >
                  {t('investigations.details.users.label')}
                </Typography>
                {filteredUsers.map(
                  (user, i) =>
                    user.USER_?.FULLNAME && (
                      <Typography
                        aria-label={`landing-investigation-user-${i}`}
                        key={user.USER_.ID}
                      >
                        <b>{user.ROLE}:</b> {user.USER_.FULLNAME}
                      </Typography>
                    )
                )}
              </div>
            )}
            {filteredPublications && (
              <div>
                <Typography
                  className={classes.subHeading}
                  component="h6"
                  variant="h6"
                  aria-label="landing-investigation-publications-label"
                >
                  {t('investigations.details.publications.label')}
                </Typography>
                {filteredPublications.map((reference, i) => (
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
            <Divider />
            <div className={classes.actionButton}>
              <AddToCartButton
                entityType="investigation"
                allIds={[parseInt(investigationId)]}
                entityId={parseInt(investigationId)}
              />
            </div>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): LandingPageDispatchProps => ({
  fetchDetails: (investigationId: number) =>
    dispatch(fetchInvestigationDetails(investigationId)),
  fetchData: (
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
          ],
        },
      })
    ),
  viewDatasets: (urlPrefix: string) => dispatch(push(`${urlPrefix}/dataset`)),
});

const mapStateToProps = (state: StateType): LandingPageStateProps => {
  return {
    data: state.dgcommon.data,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LandingPage);
