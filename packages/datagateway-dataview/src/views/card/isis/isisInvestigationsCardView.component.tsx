import { Link as MuiLink } from '@material-ui/core';
import {
  Fingerprint,
  Public,
  Save,
  Person,
  CalendarToday,
} from '@material-ui/icons';
import {
  CardView,
  CardViewDetails,
  formatCountOrSize,
  Investigation,
  tableLink,
  useInvestigationSizes,
  parseSearchToQuery,
  useDateFilter,
  useISISInvestigationCount,
  useISISInvestigationsPaginated,
  usePrincipalExperimenterFilter,
  usePushFilter,
  usePushPage,
  usePushResults,
  useSort,
  useTextFilter,
  AddToCartButton,
  DownloadButton,
  ISISInvestigationDetailsPanel,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { Theme, createStyles, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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

interface ISISInvestigationsCardViewProps {
  instrumentId: string;
  instrumentChildId: string;
  studyHierarchy: boolean;
}

const ISISInvestigationsCardView = (
  props: ISISInvestigationsCardViewProps
): React.ReactElement => {
  const { instrumentId, instrumentChildId, studyHierarchy } = props;

  const [t] = useTranslation();
  const location = useLocation();
  const { push } = useHistory();

  const { filters, view, sort, page, results } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const principalExperimenterFilter = usePrincipalExperimenterFilter(filters);
  const handleSort = useSort();
  const pushFilter = usePushFilter();
  const pushPage = usePushPage();
  const pushResults = usePushResults();

  const {
    data: totalDataCount,
    isLoading: countLoading,
  } = useISISInvestigationCount(
    parseInt(instrumentId),
    parseInt(instrumentChildId),
    studyHierarchy
  );
  const { data, isLoading: dataLoading } = useISISInvestigationsPaginated(
    parseInt(instrumentId),
    parseInt(instrumentChildId),
    studyHierarchy
  );
  const sizeQueries = useInvestigationSizes(data);

  const pathRoot = studyHierarchy ? 'browseStudyHierarchy' : 'browse';
  const instrumentChild = studyHierarchy ? 'study' : 'facilityCycle';
  const urlPrefix = `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${instrumentChildId}/investigation`;

  const title: CardViewDetails = React.useMemo(
    () => ({
      label: t('investigations.title'),
      dataKey: 'title',
      content: (investigation: Investigation) =>
        tableLink(
          `${urlPrefix}/${investigation.id}`,
          investigation.title,
          view,
          'isis-investigations-card-title'
        ),
      filterComponent: textFilter,
    }),
    [t, textFilter, urlPrefix, view]
  );

  const description: CardViewDetails = React.useMemo(
    () => ({
      label: t('investigations.details.summary'),
      dataKey: 'summary',
      filterComponent: textFilter,
    }),
    [t, textFilter]
  );

  const information: CardViewDetails[] = React.useMemo(
    () => [
      {
        icon: Fingerprint,
        label: t('investigations.name'),
        dataKey: 'name',
        filterComponent: textFilter,
      },
      {
        content: function doiFormat(entity: Investigation) {
          return (
            entity?.studyInvestigations?.[0]?.study?.pid && (
              <MuiLink
                href={`https://doi.org/${entity.studyInvestigations[0].study.pid}`}
                data-testid="isis-investigations-card-doi-link"
              >
                {entity.studyInvestigations[0].study?.pid}
              </MuiLink>
            )
          );
        },
        icon: Public,
        label: t('investigations.doi'),
        dataKey: 'studyInvestigations[0].study.pid',
        filterComponent: textFilter,
      },
      {
        icon: Save,
        label: t('investigations.details.size'),
        dataKey: 'size',
        content: (investigation: Investigation): number | string => {
          const index = data?.findIndex((item) => item.id === investigation.id);
          if (typeof index === 'undefined') return 'Unknown';
          return formatCountOrSize(sizeQueries[index], true);
        },
        disableSort: true,
      },
      {
        icon: Person,
        label: t('investigations.principal_investigators'),
        dataKey: 'investigationUsers.user.fullName',
        disableSort: true,
        content: function Content(investigation: Investigation) {
          const principal_investigators = investigation?.investigationUsers?.filter(
            (iu) => iu.role === 'principal_experimenter'
          );
          let principal_investigator = '';
          if (principal_investigators && principal_investigators.length !== 0) {
            principal_investigator =
              principal_investigators?.[0].user?.fullName ?? '';
          }

          return principal_investigator;
        },
        filterComponent: principalExperimenterFilter,
      },
      {
        icon: CalendarToday,
        label: t('investigations.details.start_date'),
        dataKey: 'startDate',
        filterComponent: dateFilter,
        defaultSort: 'desc',
      },
      {
        icon: CalendarToday,
        label: t('investigations.details.end_date'),
        dataKey: 'endDate',
        filterComponent: dateFilter,
      },
    ],
    [data, dateFilter, principalExperimenterFilter, sizeQueries, t, textFilter]
  );

  const classes = useStyles();

  const buttons = React.useMemo(
    () => [
      (investigation: Investigation) => (
        <div className={classes.actionButtons}>
          <AddToCartButton
            entityType="investigation"
            allIds={data?.map((investigation) => investigation.id) ?? []}
            entityId={investigation.id}
          />
          <DownloadButton
            entityType="investigation"
            entityId={investigation.id}
            entityName={investigation.name}
          />
        </div>
      ),
    ],
    [classes.actionButtons, data]
  );

  const moreInformation = React.useCallback(
    (investigation: Investigation) => (
      <ISISInvestigationDetailsPanel
        rowData={investigation}
        viewDatasets={(id: number) => {
          const url = view
            ? `${urlPrefix}/${id}/dataset?view=${view}`
            : `${urlPrefix}/${id}/dataset`;
          push(url);
        }}
      />
    ),
    [push, urlPrefix, view]
  );

  return (
    <CardView
      data={data ?? []}
      totalDataCount={totalDataCount ?? 0}
      onPageChange={pushPage}
      onFilter={pushFilter}
      onSort={handleSort}
      onResultsChange={pushResults}
      loadedData={!dataLoading}
      loadedCount={!countLoading}
      filters={filters}
      sort={sort}
      page={page}
      results={results}
      title={title}
      description={description}
      information={information}
      moreInformation={moreInformation}
      buttons={buttons}
    />
  );
};

export default ISISInvestigationsCardView;
