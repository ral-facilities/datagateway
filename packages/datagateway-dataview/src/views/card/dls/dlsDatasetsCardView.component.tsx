import React from 'react';
import {
  CardView,
  CardViewDetails,
  Dataset,
  tableLink,
  parseSearchToQuery,
  useDateFilter,
  useDatasetCount,
  useDatasetsPaginated,
  usePushFilter,
  usePushPage,
  usePushResults,
  useSort,
  useTextFilter,
  AddToCartButton,
  DLSDatasetDetailsPanel,
  formatBytes,
} from 'datagateway-common';
import { CalendarToday, Save } from '@mui/icons-material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

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
  const handleSort = useSort();
  const pushFilter = usePushFilter();
  const pushPage = usePushPage();
  const pushResults = usePushResults();

  // isMounted is used to disable queries when the component isn't fully mounted.
  // It prevents the request being sent twice if default sort is set.
  // It is not needed for cards/tables that don't have default sort.
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: totalDataCount, isLoading: countLoading } = useDatasetCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigation.id': { eq: investigationId },
      }),
    },
  ]);
  const { data, isLoading: dataLoading } = useDatasetsPaginated(
    [
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'investigation.id': { eq: investigationId },
        }),
      },
    ],
    isMounted
  );

  const title: CardViewDetails = React.useMemo(
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
      defaultSort: 'asc',
    }),
    [investigationId, proposalName, t, textFilter, view]
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
        icon: ConfirmationNumberIcon,
        label: t('datasets.datafile_count'),
        dataKey: 'fileCount',
      },
      {
        icon: Save,
        label: t('datasets.size'),
        dataKey: 'fileSize',
        cellContentRenderer: (dataset: Dataset): string =>
          formatBytes(dataset.fileSize),
      },
      {
        icon: CalendarToday,
        label: t('datasets.create_time'),
        dataKey: 'name',
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
    [dateFilter, t]
  );

  const buttons = React.useMemo(
    () => [
      (dataset: Dataset) => (
        <AddToCartButton
          entityType="dataset"
          allIds={data?.map((dataset) => dataset.id) ?? []}
          entityId={dataset.id}
          parentId={investigationId}
        />
      ),
    ],
    [data, investigationId]
  );

  return (
    <CardView
      data-testid="dls-datasets-card-view"
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
      moreInformation={(dataset: Dataset) => (
        <DLSDatasetDetailsPanel rowData={dataset} />
      )}
      buttons={buttons}
    />
  );
};

export default DLSDatasetsCardView;
