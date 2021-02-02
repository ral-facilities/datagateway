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
import { CalendarToday, CheckCircle, Public, Save } from '@material-ui/icons';
import { push } from 'connected-react-router';
import {
  Dataset,
  Entity,
  fetchDatasetDetails,
  fetchDatasets,
  formatBytes,
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
  fetchDetails: (datasetId: number) => Promise<void>;
  fetchData: (datasetId: number) => Promise<void>;
  viewDatafiles: (urlPrefix: string, view: ViewsType) => Action;
}

interface LandingPageStateProps {
  data: Entity[];
  view: ViewsType;
}

interface LandingPageProps {
  instrumentId: string;
  instrumentChildId: string;
  investigationId: string;
  datasetId: string;
  studyHierarchy: boolean;
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
    viewDatafiles,
    data,
    view,
    instrumentId,
    instrumentChildId,
    investigationId,
    datasetId,
    studyHierarchy,
  } = props;

  const pathRoot = studyHierarchy ? 'browseStudyHierarchy' : 'browse';
  const instrumentChild = studyHierarchy ? 'study' : 'facilityCycle';
  const urlPrefix = `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${instrumentChildId}/investigation/${investigationId}/dataset/${datasetId}`;
  const classes = useStyles();

  React.useEffect(() => {
    fetchData(parseInt(datasetId));
  }, [fetchData, datasetId]);

  React.useEffect(() => {
    if (data[0] && !data[0]?.DATASETTYPE) {
      fetchDetails(data[0].ID);
    }
  }, [fetchDetails, data]);

  const shortInfo = [
    {
      content: (entity: Dataset) => entity.DOI,
      label: t('datasets.doi'),
      icon: <Public className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Dataset) => formatBytes(entity.SIZE),
      label: t('datasets.size'),
      icon: <Save className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Dataset) => entity.STARTDATE?.slice(0, 10),
      label: t('datasets.details.start_date'),
      icon: <CalendarToday className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Dataset) => entity.ENDDATE?.slice(0, 10),
      label: t('datasets.details.end_date'),
      icon: <CalendarToday className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Dataset) =>
        entity.COMPLETE ? t('datasets.complete') : t('datasets.incomplete'),
      label: t('datasets.completion'),
      icon: <CheckCircle className={classes.shortInfoIcon} />,
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
                id="dataset-details-tab"
                aria-controls="dataset-details-panel"
                label={t('datasets.details.label')}
                value="details"
              />
              <Tab
                id="dataset-datafiles-tab"
                label={t('datasets.details.datafiles')}
                onClick={() => viewDatafiles(urlPrefix, view)}
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
              component="h6"
              variant="h6"
              aria-label="landing-dataset-name"
            >
              {data[0]?.NAME}
            </Typography>
            <Typography aria-label="landing-dataset-description">
              {data[0]?.DESCRIPTION}
            </Typography>
            <Typography
              className={classes.subHeading}
              component="h6"
              variant="h6"
              aria-label="landing-dataset-location"
            >
              {t('datasets.location')}
            </Typography>
            <Typography aria-label="landing-dataset-description">
              {data[0]?.LOCATION}
            </Typography>
            <Typography
              className={classes.subHeading}
              component="h6"
              variant="h6"
              aria-label="landing-dataset-type"
            >
              {data[0]?.DATASETTYPE?.NAME}
            </Typography>
            <Typography aria-label="landing-dataset-description">
              {data[0]?.DATASETTYPE?.DESCRIPTION}
            </Typography>
          </Grid>
          <Divider orientation="vertical" />
          {/* Short format information */}
          <Grid item xs={6} sm={5} md={4} lg={3} xl={2}>
            {shortInfo.map(
              (field, i) =>
                data[0] &&
                field.content(data[0] as Dataset) && (
                  <div className={classes.shortInfoRow} key={i}>
                    <Typography className={classes.shortInfoLabel}>
                      {field.icon}
                      {field.label}:
                    </Typography>
                    <Typography className={classes.shortInfoValue}>
                      {field.content(data[0] as Dataset)}
                    </Typography>
                  </div>
                )
            )}
            {/* Actions */}
            <div className={classes.actionButtons}>
              <AddToCartButton
                entityType="dataset"
                allIds={[parseInt(datasetId)]}
                entityId={parseInt(datasetId)}
              />
              <DownloadButton
                entityType="dataset"
                entityId={parseInt(datasetId)}
                entityName={data[0]?.NAME}
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
  fetchDetails: (datasetId: number) => dispatch(fetchDatasetDetails(datasetId)),
  fetchData: (datasetId: number) =>
    dispatch(
      fetchDatasets({
        getSize: true,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              ID: { eq: datasetId },
            }),
          },
        ],
      })
    ),
  viewDatafiles: (urlPrefix: string, view: ViewsType) => {
    const url = view
      ? `${urlPrefix}/datafile?view=${view}`
      : `${urlPrefix}/datafile`;
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
