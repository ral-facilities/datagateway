import {
  createStyles,
  Divider,
  Grid,
  makeStyles,
  Link as MuiLink,
  Paper,
  Tab,
  Tabs,
  Theme,
  Typography,
} from '@material-ui/core';
import { CalendarToday, CheckCircle, Public, Save } from '@material-ui/icons';
import {
  Dataset,
  formatCountOrSize,
  parseSearchToQuery,
  useDatasetDetails,
  useDatasetSizes,
  AddToCartButton,
  DownloadButton,
  ArrowTooltip,
  getTooltipText,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router';
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

interface LandingPageProps {
  instrumentId: string;
  instrumentChildId: string;
  investigationId: string;
  datasetId: string;
  studyHierarchy: boolean;
}

const LandingPage = (props: LandingPageProps): React.ReactElement => {
  const [t] = useTranslation();
  const { push } = useHistory();
  const location = useLocation();
  const { view } = React.useMemo(() => parseSearchToQuery(location.search), [
    location.search,
  ]);
  const [value, setValue] = React.useState<'details'>('details');
  const {
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

  const { data } = useDatasetDetails(parseInt(datasetId));
  const sizeQueries = useDatasetSizes(data ? [data] : []);

  const shortInfo = [
    {
      content: function doiFormat(entity: Dataset) {
        return (
          entity?.doi && (
            <MuiLink
              href={`https://doi.org/${entity.doi}`}
              data-testid="isis-dataset-landing-doi-link"
            >
              {entity.doi}
            </MuiLink>
          )
        );
      },
      label: t('datasets.doi'),
      icon: <Public className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Dataset) => {
        return formatCountOrSize(sizeQueries[0], true);
      },
      label: t('datasets.size'),
      icon: <Save className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Dataset) => entity.startDate?.slice(0, 10),
      label: t('datasets.details.start_date'),
      icon: <CalendarToday className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Dataset) => entity.endDate?.slice(0, 10),
      label: t('datasets.details.end_date'),
      icon: <CalendarToday className={classes.shortInfoIcon} />,
    },
    {
      content: (entity: Dataset) =>
        entity.complete ? t('datasets.complete') : t('datasets.incomplete'),
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
                onClick={() =>
                  push(
                    view
                      ? `${urlPrefix}/datafile?view=${view}`
                      : `${urlPrefix}/datafile`
                  )
                }
              />
            </Tabs>
            <Divider />
          </Paper>
        </Grid>
        <Grid item container xs={12} id="dataset-details-panel">
          {/* Long format information */}
          <Grid item xs>
            <Typography
              className={classes.subHeading}
              component="h6"
              variant="h6"
              aria-label="landing-dataset-name"
            >
              {data?.name}
            </Typography>
            <Typography aria-label="landing-dataset-description">
              {data?.description}
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
              {data?.location}
            </Typography>
            <Typography
              className={classes.subHeading}
              component="h6"
              variant="h6"
              aria-label="landing-dataset-type"
            >
              {data?.type?.name}
            </Typography>
            <Typography aria-label="landing-dataset-description">
              {data?.type?.description}
            </Typography>
          </Grid>
          <Divider orientation="vertical" />
          {/* Short format information */}
          <Grid item xs={6} sm={5} md={4} lg={3} xl={2}>
            {shortInfo.map(
              (field, i) =>
                data &&
                field.content(data as Dataset) && (
                  <div className={classes.shortInfoRow} key={i}>
                    <Typography className={classes.shortInfoLabel}>
                      {field.icon}
                      {field.label}:
                    </Typography>
                    <Typography className={classes.shortInfoValue}>
                      <ArrowTooltip
                        title={getTooltipText(field.content(data as Dataset))}
                      >
                        <Typography>
                          {field.content(data as Dataset)}
                        </Typography>
                      </ArrowTooltip>
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
                entityName={data?.name ?? ''}
              />
            </div>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LandingPage;
