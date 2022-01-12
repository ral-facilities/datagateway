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
  usePushFilter,
  usePushPage,
  usePushResults,
  useSort,
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
  ISISDatasetDetailsPanel,
  DLSDatasetDetailsPanel,
} from 'datagateway-common';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { StateType } from '../state/app.types';

interface DatasetCardViewProps {
  hierarchy: string;
}

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

const DatasetCardView = (props: DatasetCardViewProps): React.ReactElement => {
  const { hierarchy } = props;

  const { data: facilityCycles } = useAllFacilityCycles(hierarchy === 'isis');

  const location = useLocation();
  const { push } = useHistory();
  const queryParams = React.useMemo(() => parseSearchToQuery(location.search), [
    location.search,
  ]);
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

  const dlsLinkURL = (
    datasetData: Dataset,
    linkType = 'dataset'
  ): string | null => {
    if (datasetData.investigation) {
      return linkType === 'investigation'
        ? `/browse/proposal/${datasetData.investigation.name}/investigation/${datasetData.investigation.id}/dataset`
        : `/browse/proposal/${datasetData.investigation.name}/investigation/${datasetData.investigation.id}/dataset/${datasetData.id}/datafile`;
    }
    return null;
  };

  const dlsLink = React.useCallback(
    (
      datasetData: Dataset,
      linkType = 'dataset'
    ): React.ReactElement | string => {
      const linkURL = dlsLinkURL(datasetData, linkType);

      if (datasetData.investigation && linkURL) {
        return linkType === 'investigation'
          ? tableLink(linkURL, datasetData.investigation.title)
          : tableLink(linkURL, datasetData.name);
      }
      return linkType === 'investigation' ? '' : datasetData.name;
    },
    []
  );

  const isisLinkURL = React.useCallback(
    (datasetData: Dataset, linkType = 'dataset') => {
      let instrumentId;
      let facilityCycleId;
      if (datasetData.investigation?.investigationInstruments?.length) {
        instrumentId =
          datasetData.investigation?.investigationInstruments[0].instrument?.id;
      } else {
        return null;
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
          ? `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${datasetData.investigation.id}`
          : `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${datasetData.investigation.id}/dataset/${datasetData.id}`;
      }
      return null;
    },
    [facilityCycles]
  );

  const isisLink = React.useCallback(
    (datasetData: Dataset, linkType = 'dataset') => {
      const linkURL = isisLinkURL(datasetData, linkType);

      if (datasetData.investigation && linkURL) {
        return linkType === 'investigation'
          ? tableLink(linkURL, datasetData.investigation.title)
          : tableLink(linkURL, datasetData.name);
      } else return linkType === 'investigation' ? '' : datasetData.name;
    },
    [isisLinkURL]
  );

  const genericLinkURL = React.useCallback(
    (datasetData: Dataset, linkType = 'dataset'): string | null => {
      if (datasetData.investigation) {
        return linkType === 'investigation'
          ? `/browse/investigation/${datasetData.investigation.id}/dataset`
          : `/browse/investigation/${datasetData.investigation.id}/dataset/${datasetData.id}/datafile`;
      }
      return null;
    },
    []
  );

  const genericLink = React.useCallback(
    (
      datasetData: Dataset,
      linkType = 'dataset'
    ): React.ReactElement | string => {
      const linkURL = genericLinkURL(datasetData, linkType);
      if (datasetData.investigation && linkURL) {
        return linkType === 'investigation'
          ? tableLink(linkURL, datasetData.investigation.title)
          : tableLink(linkURL, datasetData.name);
      }
      return linkType === 'investigation' ? '' : datasetData.name;
    },
    [genericLinkURL]
  );

  const hierarchyLinkURL = React.useMemo(() => {
    if (hierarchy === 'dls') {
      return dlsLinkURL;
    } else if (hierarchy === 'isis') {
      return isisLinkURL;
    } else {
      return genericLinkURL;
    }
  }, [genericLinkURL, hierarchy, isisLinkURL]);

  const hierarchyLink = React.useMemo(() => {
    if (hierarchy === 'dls') {
      return dlsLink;
    } else if (hierarchy === 'isis') {
      return isisLink;
    } else {
      return genericLink;
    }
  }, [dlsLink, genericLink, hierarchy, isisLink]);
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

  const moreInformation = React.useCallback(
    (dataset: Dataset) => {
      const datasetsURL = hierarchyLinkURL(dataset);

      if (hierarchy === 'isis') {
        return (
          <ISISDatasetDetailsPanel
            rowData={dataset}
            viewDatafiles={
              datasetsURL
                ? (id: number) => {
                    push(datasetsURL);
                  }
                : undefined
            }
          />
        );
      } else {
        return <DLSDatasetDetailsPanel rowData={dataset} />;
      }
    },
    [hierarchy, hierarchyLinkURL, push]
  );

  const classes = useStyles();

  const buttons = React.useMemo(
    () =>
      hierarchy !== 'dls'
        ? [
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

    [classes.actionButtons, data, hierarchy]
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
