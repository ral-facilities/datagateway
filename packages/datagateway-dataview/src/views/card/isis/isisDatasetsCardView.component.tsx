import React from 'react';
import {
  CardView,
  CardViewDetails,
  Dataset,
  tableLink,
  formatBytes,
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
  DownloadButton,
  ISISDatasetDetailsPanel,
} from 'datagateway-common';
import { Save, CalendarToday } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { styled } from '@mui/material';

const ActionButtonsContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  '& button': {
    margin: 'auto',
    marginTop: theme.spacing(1),
  },
}));

interface ISISDatasetCardViewProps {
  investigationId: string;
}

const ISISDatasetsCardView = (
  props: ISISDatasetCardViewProps
): React.ReactElement => {
  const { investigationId } = props;

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
        tableLink(`${location.pathname}/${dataset.id}`, dataset.name, view),
      filterComponent: textFilter,
    }),
    [t, textFilter, location.pathname, view]
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
          return formatBytes(dataset.fileSize);
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
    [data, dateFilter, t]
  );

  const buttons = React.useMemo(
    () => [
      (dataset: Dataset) => (
        <ActionButtonsContainer>
          <AddToCartButton
            entityType="dataset"
            allIds={data?.map((dataset) => dataset.id) ?? []}
            entityId={dataset.id}
          />
          <DownloadButton
            entityType="dataset"
            entityId={dataset.id}
            entityName={dataset.name}
            entitySize={dataset.fileSize ?? -1}
          />
        </ActionButtonsContainer>
      ),
    ],
    [data]
  );

  const moreInformation = React.useCallback(
    (dataset: Dataset) => (
      <ISISDatasetDetailsPanel
        rowData={dataset}
        viewDatafiles={(id: number) => {
          const url = view
            ? `${location.pathname}/${id}/datafile?view=${view}`
            : `${location.pathname}/${id}/datafile`;
          push(url);
        }}
      />
    ),
    [push, location.pathname, view]
  );

  return (
    <CardView
      data-testid="isis-datasets-card-view"
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

export default ISISDatasetsCardView;
