import React from 'react';
import { ConfirmationNumber, CalendarToday } from '@material-ui/icons';
import {
  CardView,
  Dataset,
  datasetLink,
  parseSearchToQuery,
  useDateFilter,
  useDatasetCount,
  useDatasetsPaginated,
  useUpdateFilter,
  useUpdatePage,
  useUpdateResults,
  useSort,
  useTextFilter,
  AddToCartButton,
} from 'datagateway-common';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface DatasetCardViewProps {
  investigationId: string;
}

const DatasetCardView = (props: DatasetCardViewProps): React.ReactElement => {
  const { investigationId } = props;

  const [t] = useTranslation();
  const location = useLocation();

  const { filters, view, sort, page, results } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters, 'push');
  const dateFilter = useDateFilter(filters, 'push');
  const handleSort = useSort();
  const pushFilter = useUpdateFilter('push');
  const pushPage = useUpdatePage('push');
  const pushResults = useUpdateResults('push');

  const { data: totalDataCount, isLoading: countLoading } = useDatasetCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigation.id': { eq: investigationId },
      }),
    },
  ]);
  const { isLoading: dataLoading, data } = useDatasetsPaginated([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigation.id': { eq: investigationId },
      }),
    },
  ]);

  const title = React.useMemo(
    () => ({
      // Provide label for filter component.
      label: t('datasets.name'),
      // Provide both the dataKey (for tooltip) and content to render.
      dataKey: 'name',
      content: (dataset: Dataset) => {
        return datasetLink(investigationId, dataset.id, dataset.name, view);
      },
      filterComponent: textFilter,
    }),
    [investigationId, t, textFilter, view]
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
        icon: ConfirmationNumber,
        label: t('datasets.datafile_count'),
        dataKey: 'datafileCount',
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
    ],
    [dateFilter, t]
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
      buttons={buttons}
    />
  );
};

export default DatasetCardView;
