import {
  CalendarToday,
  ConfirmationNumber,
  Fingerprint,
} from '@mui/icons-material';
import { styled } from '@mui/material';
import {
  AddToCartButton,
  buildDatafileTableUrlForDataset,
  buildDatasetLandingUrl,
  buildDatasetTableUrlForInvestigation,
  buildInvestigationLandingUrl,
  CardView,
  Dataset,
  DatasetDetailsPanel,
  DLSDatasetDetailsPanel,
  DownloadButton,
  FACILITY_NAME,
  formatBytes,
  ISISDatasetDetailsPanel,
  parseSearchToQuery,
  tableLink,
  useDatasetCount,
  useDatasetsPaginated,
  useDateFilter,
  useLuceneSearch,
  usePushFilter,
  usePushPage,
  usePushResults,
  useSort,
  useTextFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { StateType } from '../state/app.types';

interface DatasetCardViewProps {
  hierarchy: string;
}

const ActionButtonDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  '& button': {
    margin: 'auto',
    marginTop: theme.spacing(1),
  },
}));

const DatasetCardView = (props: DatasetCardViewProps): React.ReactElement => {
  const { hierarchy } = props;

  const location = useLocation();
  const { push } = useHistory();
  const queryParams = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
  const { startDate, endDate } = queryParams;
  const searchText = queryParams.searchText ? queryParams.searchText : '';

  const maxNumResults = useSelector(
    (state: StateType) => state.dgsearch.maxNumResults
  );

  const { data: luceneData } = useLuceneSearch('Dataset', {
    searchText,
    startDate,
    endDate,
    maxCount: maxNumResults,
  });

  const [t] = useTranslation();

  const { filters, sort, page, results } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const handleSort = useSort();
  const pushFilter = usePushFilter();
  const pushPage = usePushPage();
  const pushResults = usePushResults();

  const { data: totalDataCount, isLoading: countLoading } = useDatasetCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        id: { in: luceneData || [] },
      }),
    },
  ]);
  const { isLoading: dataLoading, data } = useDatasetsPaginated([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        id: { in: luceneData || [] },
      }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify({
        investigation: { investigationInstruments: 'instrument' },
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
        const url =
          hierarchy === FACILITY_NAME.isis
            ? buildDatasetLandingUrl(dataset)
            : buildDatafileTableUrlForDataset({
                dataset,
                facilityName: hierarchy,
              });
        return url ? tableLink(url, dataset.name) : dataset.name;
      },
      filterComponent: textFilter,
    }),
    [hierarchy, t, textFilter]
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
        label:
          hierarchy === FACILITY_NAME.isis
            ? t('datasets.size')
            : t('datasets.datafile_count'),
        dataKey: hierarchy === 'isis' ? 'size' : 'datafileCount',
        content: (dataset: Dataset): string => {
          const index = data?.findIndex((item) => item.id === dataset.id);
          if (typeof index === 'undefined') return 'Unknown';
          return hierarchy === FACILITY_NAME.isis
            ? formatBytes(dataset.fileSize)
            : dataset.fileCount?.toString() ?? 'Unknown';
        },
        disableSort: true,
      },
      {
        icon: Fingerprint,
        label: t('datasets.investigation'),
        dataKey: 'investigation.title',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        content: (dataset: Dataset): any => {
          const investigation = dataset.investigation;
          if (!investigation) return '';

          const url =
            hierarchy === FACILITY_NAME.isis
              ? buildInvestigationLandingUrl(investigation)
              : buildDatasetTableUrlForInvestigation({
                  investigation,
                  facilityName: hierarchy,
                });
          return url
            ? tableLink(url, investigation.title)
            : investigation.title;
        },
        filterComponent: textFilter,
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
    [data, dateFilter, hierarchy, t, textFilter]
  );

  const moreInformation = React.useCallback(
    (dataset: Dataset) => {
      switch (hierarchy) {
        case FACILITY_NAME.isis:
          const datasetsUrl = buildDatafileTableUrlForDataset({
            dataset,
            facilityName: hierarchy,
          });
          return (
            <ISISDatasetDetailsPanel
              rowData={dataset}
              viewDatafiles={() => {
                if (datasetsUrl) push(datasetsUrl);
              }}
            />
          );

        case FACILITY_NAME.dls:
          return <DLSDatasetDetailsPanel rowData={dataset} />;

        default:
          return <DatasetDetailsPanel rowData={dataset} />;
      }
    },
    [hierarchy, push]
  );

  const buttons = React.useMemo(
    () =>
      hierarchy !== 'dls'
        ? [
            (dataset: Dataset) => (
              <ActionButtonDiv>
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
              </ActionButtonDiv>
            ),
          ]
        : [
            (dataset: Dataset) => (
              <AddToCartButton
                entityType="dataset"
                allIds={data?.map((dataset) => dataset.id) ?? []}
                entityId={dataset.id}
              />
            ),
          ],

    [data, hierarchy]
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

export default DatasetCardView;
