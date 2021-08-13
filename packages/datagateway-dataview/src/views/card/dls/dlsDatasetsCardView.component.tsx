import React from 'react';
import {
  CardView,
  Dataset,
  tableLink,
  parseSearchToQuery,
  useDateFilter,
  useDatasetCount,
  useDatasetsPaginated,
  usePushFilters,
  usePushPage,
  usePushResults,
  usePushSort,
  useTextFilter,
  useFilter,
  useDatasetsDatafileCount,
} from 'datagateway-common';
import { CalendarToday } from '@material-ui/icons';
import ConfirmationNumberIcon from '@material-ui/icons/ConfirmationNumber';
import DatasetDetailsPanel from '../../detailsPanels/dls/datasetDetailsPanel.component';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import AddToCartButton from '../../addToCartButton.component';

interface DLSDatasetsCVProps {
  proposalName: string;
  investigationId: string;
}

const DLSDatasetsCardView = (props: DLSDatasetsCVProps): React.ReactElement => {
  const { proposalName, investigationId } = props;

  const [t] = useTranslation();
  const location = useLocation();

  const { filters, view, sort, page, results } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const pushSort = usePushSort();
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
    {
      filterType: 'include',
      filterValue: JSON.stringify('investigation'),
    },
  ]);
  const { data, isLoading: dataLoading } = useDatasetsPaginated([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigation.id': { eq: investigationId },
      }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify('investigation'),
    },
  ]);

  const { data: typeIds } = useFilter('dataset', 'type.id', [
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigation.id': { eq: investigationId },
      }),
    },
  ]);

  const datafileCountQueries = useDatasetsDatafileCount(data);

  const title = React.useMemo(
    () => ({
      // Provide label for filter component.
      label: t('datasets.name'),
      // Provide both the dataKey (for tooltip) and content to render.
      dataKey: 'name',
      content: (dataset: Dataset) =>
        tableLink(
          `/browse/proposal/${proposalName}/investigation/${investigationId}/dataset/${dataset.id}/datafile`,
          dataset.name,
          view
        ),
      filterComponent: textFilter,
    }),
    [investigationId, proposalName, t, textFilter, view]
  );

  const description = React.useMemo(
    () => ({
      label: t('datasets.details.description'),
      dataKey: 'description',
      filterComponent: textFilter,
    }),
    [t, textFilter]
  );

  const information = React.useMemo(
    () => [
      {
        icon: ConfirmationNumberIcon,
        label: t('datasets.datafile_count'),
        dataKey: 'datafileCount',
        content: (dataset: Dataset): number | string => {
          const index = data?.findIndex((item) => item.id === dataset.id);
          if (typeof index === 'undefined') return 'Unknown';
          const countQuery = datafileCountQueries[index];
          if (countQuery?.isFetching) {
            return 'Calculating...';
          } else {
            return countQuery?.data ?? 'Unknown';
          }
        },
        disableSort: true,
      },
      {
        icon: CalendarToday,
        label: t('datasets.create_time'),
        dataKey: 'createTime',
        filterComponent: dateFilter,
      },
      {
        icon: CalendarToday,
        label: t('datasets.modified_time'),
        dataKey: 'modTime',
        filterComponent: dateFilter,
      },
      {
        icon: CalendarToday,
        label: t('datasets.details.start_date'),
        dataKey: 'startDate',
        filterComponent: dateFilter,
      },
      {
        icon: CalendarToday,
        label: t('datasets.details.end_date'),
        dataKey: 'endDate',
        filterComponent: dateFilter,
      },
    ],
    [data, datafileCountQueries, dateFilter, t]
  );

  const buttons = React.useMemo(
    () => [
      (dataset: Dataset) => (
        <AddToCartButton
          entityType="dataset"
          allIds={data?.map((dataset) => dataset.id) ?? []}
          entityId={dataset.id}
        />
      ),
    ],
    [data]
  );

  const customFilters = React.useMemo(
    () => [
      {
        label: t('datasets.type.id'),
        dataKey: 'type.id',
        filterItems: typeIds ?? [],
      },
    ],
    [t, typeIds]
  );

  return (
    <CardView
      data={data ?? []}
      totalDataCount={totalDataCount ?? 0}
      onPageChange={pushPage}
      onFilter={pushFilters}
      onSort={pushSort}
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
      moreInformation={(dataset: Dataset) => (
        <DatasetDetailsPanel rowData={dataset} />
      )}
      buttons={buttons}
      customFilters={customFilters}
    />
  );
};

export default DLSDatasetsCardView;
