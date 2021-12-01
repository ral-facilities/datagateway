import React from 'react';
import {
  CardView,
  Dataset,
  tableLink,
  formatCountOrSize,
  useDatasetSizes,
  parseSearchToQuery,
  useDateFilter,
  useDatasetCount,
  useDatasetsPaginated,
  usePushFilters,
  usePushPage,
  usePushResults,
  useSort,
  useTextFilter,
  AddToCartButton,
  DownloadButton,
} from 'datagateway-common';
import { Save, CalendarToday } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import DatasetDetailsPanel from '../../detailsPanels/isis/datasetDetailsPanel.component';
import { useHistory, useLocation } from 'react-router';
import { Theme, createStyles, makeStyles } from '@material-ui/core';
import { CardViewDetails } from 'datagateway-common/lib/card/cardView.component';

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

interface ISISDatasetCardViewProps {
  instrumentId: string;
  instrumentChildId: string;
  investigationId: string;
  studyHierarchy: boolean;
}

const ISISDatasetsCardView = (
  props: ISISDatasetCardViewProps
): React.ReactElement => {
  const {
    instrumentId,
    instrumentChildId,
    investigationId,
    studyHierarchy,
  } = props;

  const [t] = useTranslation();
  const location = useLocation();
  const { push } = useHistory();

  const { filters, view, sort, page, results } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const handleSort = useSort();
  const pushFilters = usePushFilters();
  const pushPage = usePushPage();
  const pushResults = usePushResults();

  const { data: totalDataCount, isLoading: countLoading } = useDatasetCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigation.id': { eq: investigationId },
      }),
    },
  ]);
  const { data, isLoading: dataLoading } = useDatasetsPaginated([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigation.id': { eq: investigationId },
      }),
    },
  ]);
  const sizeQueries = useDatasetSizes(data);

  const pathRoot = studyHierarchy ? 'browseStudyHierarchy' : 'browse';
  const instrumentChild = studyHierarchy ? 'study' : 'facilityCycle';
  const urlPrefix = `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${instrumentChildId}/investigation/${investigationId}/dataset`;

  const title: CardViewDetails = React.useMemo(
    () => ({
      // Provide label for filter component.
      label: t('datasets.name'),
      // Provide both the dataKey (for tooltip) and content to render.
      dataKey: 'name',
      content: (dataset: Dataset) =>
        tableLink(`${urlPrefix}/${dataset.id}`, dataset.name, view),
      filterComponent: textFilter,
    }),
    [t, textFilter, urlPrefix, view]
  );

  const description: CardViewDetails = React.useMemo(
    () => ({
      label: t('datasets.details.description'),
      dataKey: 'description',
      filterComponent: textFilter,
    }),
    [t, textFilter]
  );

  const information: CardViewDetails[] = React.useMemo(
    () => [
      {
        icon: Save,
        label: t('datasets.size'),
        dataKey: 'size',
        content: (dataset: Dataset): string => {
          const index = data?.findIndex((item) => item.id === dataset.id);
          if (typeof index === 'undefined') return 'Unknown';
          return formatCountOrSize(sizeQueries[index], true);
        },
        disableSort: true,
      },
      {
        icon: CalendarToday,
        label: t('datasets.create_time'),
        dataKey: 'createTime',
        filterComponent: dateFilter,
        defaultSort: 'desc',
      },
      {
        icon: CalendarToday,
        label: t('datasets.modified_time'),
        dataKey: 'modTime',
        filterComponent: dateFilter,
      },
    ],
    [data, dateFilter, sizeQueries, t]
  );

  const classes = useStyles();

  const buttons = React.useMemo(
    () => [
      (dataset: Dataset) => (
        <div className={classes.actionButtons}>
          <AddToCartButton
            entityType="dataset"
            allIds={data?.map((dataset) => dataset.id) ?? []}
            entityId={dataset.id}
          />
          <DownloadButton
            entityType="dataset"
            entityId={dataset.id}
            entityName={dataset.name}
          />
        </div>
      ),
    ],
    [classes.actionButtons, data]
  );

  const moreInformation = React.useCallback(
    (dataset: Dataset) => (
      <DatasetDetailsPanel
        rowData={dataset}
        viewDatafiles={(id: number) => {
          const url = view
            ? `${urlPrefix}/${id}/datafile?view=${view}`
            : `${urlPrefix}/${id}/datafile`;
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
      onFilter={pushFilters}
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

export default ISISDatasetsCardView;
