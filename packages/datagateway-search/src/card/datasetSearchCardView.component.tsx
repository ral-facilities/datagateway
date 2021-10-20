import React from 'react';
import {
  ConfirmationNumber,
  CalendarToday,
  Fingerprint,
} from '@material-ui/icons';
import {
  CardView,
  Dataset,
  parseSearchToQuery,
  useDateFilter,
  useDatasetCount,
  useDatasetsPaginated,
  usePushFilters,
  usePushPage,
  usePushResults,
  usePushSort,
  useTextFilter,
  useAllFacilityCycles,
  useLuceneSearch,
  FacilityCycle,
  tableLink,
  useDatasetsDatafileCount,
  useDatasetSizes,
  formatCountOrSize,
  AddToCartButton,
  DownloadButton,
} from 'datagateway-common';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { StateType } from '../state/app.types';

interface DatasetCardViewProps {
  hierarchy: string;
}

const DatasetCardView = (props: DatasetCardViewProps): React.ReactElement => {
  const { hierarchy } = props;

  const { data: facilityCycles } = useAllFacilityCycles(hierarchy === 'isis');

  const searchText = useSelector(
    (state: StateType) => state.dgsearch.searchText
  );
  const startDate = useSelector(
    (state: StateType) => state.dgsearch.selectDate.startDate
  );
  const endDate = useSelector(
    (state: StateType) => state.dgsearch.selectDate.endDate
  );
  const { data: luceneData } = useLuceneSearch('Dataset', {
    searchText,
    startDate,
    endDate,
  });

  const [t] = useTranslation();
  const location = useLocation();

  const { filters, sort, page, results } = React.useMemo(
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

  const dlsLink = (
    datasetData: Dataset,
    linkType = 'dataset'
  ): React.ReactElement | string => {
    if (datasetData.investigation) {
      return linkType === 'investigation'
        ? tableLink(
            `/browse/proposal/${datasetData.investigation.name}/investigation/${datasetData.investigation.id}/dataset`,
            datasetData.investigation.title
          )
        : tableLink(
            `/browse/proposal/${datasetData.investigation.name}/investigation/${datasetData.investigation.id}/dataset/${datasetData.id}/datafile`,
            datasetData.name
          );
    }
    return linkType === 'investigation' ? '' : datasetData.name;
  };

  const isisLink = React.useCallback(
    (datasetData: Dataset, linkType = 'dataset') => {
      let instrumentId;
      let facilityCycleId;
      if (datasetData.investigation?.investigationInstruments?.length) {
        instrumentId =
          datasetData.investigation?.investigationInstruments[0].instrument?.id;
      } else {
        return linkType === 'investigation' ? '' : datasetData.name;
      }

      if (facilityCycles?.length && datasetData.investigation?.startDate) {
        const filteredFacilityCycles: FacilityCycle[] = facilityCycles?.filter(
          (facilityCycle: FacilityCycle) =>
            datasetData.investigation?.startDate &&
            facilityCycle.startDate &&
            facilityCycle.endDate &&
            datasetData.investigation.startDate >= facilityCycle.startDate &&
            datasetData.investigation.startDate <= facilityCycle.endDate
        );
        if (filteredFacilityCycles.length) {
          facilityCycleId = filteredFacilityCycles[0].id;
        }
      }

      if (facilityCycleId) {
        return linkType === 'investigation'
          ? tableLink(
              `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${datasetData.investigation.id}`,
              datasetData.investigation.title
            )
          : tableLink(
              `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${datasetData.investigation.id}/dataset/${datasetData.id}`,
              datasetData.name
            );
      }
      return linkType === 'investigation' ? '' : datasetData.name;
    },
    [facilityCycles]
  );

  const genericLink = (
    datasetData: Dataset,
    linkType = 'dataset'
  ): React.ReactElement | string => {
    if (datasetData.investigation) {
      return linkType === 'investigation'
        ? tableLink(
            `/browse/investigation/${datasetData.investigation.id}/dataset`,
            datasetData.investigation.title
          )
        : tableLink(
            `/browse/investigation/${datasetData.investigation.id}/dataset/${datasetData.id}/datafile`,
            datasetData.name
          );
    }
    return linkType === 'investigation' ? '' : datasetData.name;
  };

  const hierarchyLink = React.useMemo(() => {
    if (hierarchy === 'dls') {
      return dlsLink;
    } else if (hierarchy === 'isis') {
      return isisLink;
    } else {
      return genericLink;
    }
  }, [hierarchy, isisLink]);

  // hierarchy === 'isis' ? data : [] is a 'hack' to only perform
  // the correct calculation queries for each facility
  const datasetCountQueries = useDatasetsDatafileCount(
    hierarchy !== 'isis' ? data : []
  );
  const sizeQueries = useDatasetSizes(hierarchy === 'isis' ? data : []);

  const title = React.useMemo(
    () => ({
      // Provide label for filter component.
      label: t('datasets.name'),
      // Provide both the dataKey (for tooltip) and content to render.
      dataKey: 'name',
      content: (dataset: Dataset) => {
        return hierarchyLink(dataset);
      },
      filterComponent: textFilter,
    }),
    [hierarchyLink, t, textFilter]
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
          hierarchy === 'isis'
            ? t('datasets.size')
            : t('datasets.datafile_count'),
        dataKey: hierarchy === 'isis' ? 'size' : 'datafileCount',
        content: (dataset: Dataset): string => {
          const index = data?.findIndex((item) => item.id === dataset.id);
          if (typeof index === 'undefined') return 'Unknown';
          const query =
            hierarchy === 'isis'
              ? sizeQueries[index]
              : datasetCountQueries[index];
          return formatCountOrSize(query, hierarchy === 'isis');
        },
        disableSort: true,
      },
      {
        icon: Fingerprint,
        label: t('datasets.investigation'),
        dataKey: 'investigation.title',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        content: (dataset: Dataset): any => {
          return hierarchyLink(dataset, 'investigation');
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
    [
      data,
      datasetCountQueries,
      dateFilter,
      hierarchy,
      hierarchyLink,
      sizeQueries,
      t,
      textFilter,
    ]
  );

  const buttons = React.useMemo(
    () => [
      (dataset: Dataset) => (
        <div>
          <AddToCartButton
            entityType="dataset"
            allIds={data?.map((dataset) => dataset.id) ?? []}
            entityId={dataset.id}
          />
          <DownloadButton
            entityType="dataset"
            entityId={dataset.id}
            entityName={dataset.name}
            variant="outlined"
          />
        </div>
      ),
    ],
    [data]
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
      buttons={buttons}
    />
  );
};

export default DatasetCardView;
