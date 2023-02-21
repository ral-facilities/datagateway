import {
  Divider,
  Grid,
  Link as MuiLink,
  Paper,
  styled,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { CalendarToday, CheckCircle, Public, Save } from '@mui/icons-material';
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
import { useHistory, useLocation } from 'react-router-dom';
import Branding from './isisBranding.component';

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
  const { view } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
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

  const { data } = useDatasetDetails(parseInt(datasetId));
  const sizeQueries = useDatasetSizes(data);

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
      icon: <Public sx={shortInfoIconStyle} />,
    },
    {
      content: (entity: Dataset) => {
        return formatCountOrSize(sizeQueries[0], true);
      },
      label: t('datasets.size'),
      icon: <Save sx={shortInfoIconStyle} />,
    },
    {
      content: (entity: Dataset) => entity.startDate?.slice(0, 10),
      label: t('datasets.details.start_date'),
      icon: <CalendarToday sx={shortInfoIconStyle} />,
    },
    {
      content: (entity: Dataset) => entity.endDate?.slice(0, 10),
      label: t('datasets.details.end_date'),
      icon: <CalendarToday sx={shortInfoIconStyle} />,
    },
    {
      content: (entity: Dataset) =>
        entity.complete ? t('datasets.complete') : t('datasets.incomplete'),
      label: t('datasets.completion'),
      icon: <CheckCircle sx={shortInfoIconStyle} />,
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
              indicatorColor="secondary"
              textColor="secondary"
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
            <Subheading variant="h6" aria-label="landing-dataset-name">
              {data?.name}
            </Subheading>
            <Typography aria-label="landing-dataset-description">
              {data?.description}
            </Typography>
            <Subheading variant="h6" aria-label="landing-dataset-location">
              {t('datasets.location')}
            </Subheading>
            <Typography aria-label="landing-dataset-description">
              {data?.location}
            </Typography>
            <Subheading variant="h6" aria-label="landing-dataset-type">
              {data?.type?.name}
            </Subheading>
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
                  <ShortInfoRow key={i}>
                    <ShortInfoLabel>
                      {field.icon}
                      {field.label}:
                    </ShortInfoLabel>
                    <ArrowTooltip
                      title={getTooltipText(field.content(data as Dataset))}
                    >
                      <ShortInfoValue>
                        {field.content(data as Dataset)}
                      </ShortInfoValue>
                    </ArrowTooltip>
                  </ShortInfoRow>
                )
            )}
            {/* Actions */}
            <ActionButtonsContainer>
              <AddToCartButton
                entityType="dataset"
                allIds={[parseInt(datasetId)]}
                entityId={parseInt(datasetId)}
              />
              <DownloadButton
                entityType="dataset"
                entityId={parseInt(datasetId)}
                entityName={data?.name ?? ''}
                entitySize={sizeQueries[0]?.data ?? -1}
              />
            </ActionButtonsContainer>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LandingPage;
