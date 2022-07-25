import React from 'react';
import {
  Table,
  Investigation,
  tableLink,
  externalSiteLink,
  FacilityCycle,
  ColumnType,
  parseSearchToQuery,
  useAddToCart,
  useAllFacilityCycles,
  useCart,
  useSort,
  useRemoveFromCart,
  useInvestigationsDatasetCount,
  useInvestigationSizes,
  formatCountOrSize,
  InvestigationDetailsPanel,
  ISISInvestigationDetailsPanel,
  DLSVisitDetailsPanel,
  SearchResultSource,
  useLuceneSearchInfinite,
  SearchResponse,
  formatBytes,
} from 'datagateway-common';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { StateType } from '../state/app.types';
import { useSelector } from 'react-redux';
import { Paper, Typography } from '@material-ui/core';

interface InvestigationTableProps {
  hierarchy: string;
}

const InvestigationSearchTable = (
  props: InvestigationTableProps
): React.ReactElement => {
  const { hierarchy } = props;

  const { data: facilityCycles } = useAllFacilityCycles(hierarchy === 'isis');

  const location = useLocation();
  const { push } = useHistory();
  const queryParams = React.useMemo(() => parseSearchToQuery(location.search), [
    location.search,
  ]);
  const { startDate, endDate, sort, filters, restrict } = queryParams;
  const searchText = queryParams.searchText ? queryParams.searchText : '';

  const selectAllSetting = useSelector(
    (state: StateType) => state.dgsearch.selectAllSetting
  );

  const minNumResults = useSelector(
    (state: StateType) => state.dgsearch.minNumResults
  );

  const maxNumResults = useSelector(
    (state: StateType) => state.dgsearch.maxNumResults
  );

  const [t] = useTranslation();

  const { fetchNextPage, data, hasNextPage } = useLuceneSearchInfinite(
    'Investigation',
    {
      searchText,
      startDate,
      endDate,
      sort,
      minCount: minNumResults,
      maxCount: maxNumResults,
      restrict,
      facets: [
        { target: 'Investigation' },
        {
          target: 'InvestigationParameter',
          dimensions: [{ dimension: 'type.name' }],
        },
        {
          target: 'Sample',
          dimensions: [{ dimension: 'type.name' }],
        },
      ],
    },
    filters
  );
  const { data: cartItems } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } = useAddToCart(
    'investigation'
  );
  const {
    mutate: removeFromCart,
    isLoading: removeFromCartLoading,
  } = useRemoveFromCart('investigation');

  function mapSource(response: SearchResponse): SearchResultSource[] {
    return response.results?.map((result) => result.source) ?? [];
  }

  function mapIds(response: SearchResponse): number[] {
    return response.results?.map((result) => result.id) ?? [];
  }

  const { aggregatedSource, aggregatedIds, aborted } = React.useMemo(() => {
    const definedData = data ?? {
      results: [],
    };
    if ('pages' in definedData) {
      return {
        aggregatedSource: definedData.pages
          .map((response) => mapSource(response))
          .flat(),
        aggregatedIds: definedData.pages
          .map((response) => mapIds(response))
          .flat(),
        aborted: definedData.pages[definedData.pages.length - 1].aborted,
      };
    } else {
      return {
        aggregatedSource: mapSource(definedData),
        aggregatedIds: mapIds(definedData),
        aborted: false,
      };
    }
  }, [data]);

  const handleSort = useSort();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage(),
    [fetchNextPage]
  );

  const dlsLinkURL = (investigationData: SearchResultSource): string =>
    `/browse/proposal/${investigationData.name}/investigation/${investigationData.id}/dataset`;

  const isisLinkURL = React.useCallback(
    (investigationData: SearchResultSource) => {
      let instrumentId;
      let facilityCycleId;
      if (investigationData.investigationinstrument?.length) {
        instrumentId =
          investigationData.investigationinstrument[0]['instrument.id'];
      } else {
        return null;
      }

      if (investigationData.startDate && facilityCycles?.length) {
        const investigationDate = new Date(
          investigationData.startDate
        ).toISOString();
        const filteredFacilityCycles: FacilityCycle[] = facilityCycles?.filter(
          (facilityCycle: FacilityCycle) =>
            facilityCycle.startDate &&
            facilityCycle.endDate &&
            investigationDate >= facilityCycle.startDate &&
            investigationDate <= facilityCycle.endDate
        );
        if (filteredFacilityCycles.length) {
          facilityCycleId = filteredFacilityCycles[0].id;
        }
      }

      if (facilityCycleId)
        return `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${investigationData.id}/dataset`;
      else return null;
    },
    [facilityCycles]
  );

  const isisLink = React.useCallback(
    (investigationData: SearchResultSource) => {
      const linkURL = isisLinkURL(investigationData);

      if (linkURL && investigationData.title)
        return tableLink(linkURL, investigationData.title);
      else return investigationData.title;
    },
    [isisLinkURL]
  );

  const genericLinkURL = (investigationData: SearchResultSource): string =>
    `/browse/investigation/${investigationData.id}/dataset`;

  const hierarchyLinkURL = React.useMemo(() => {
    if (hierarchy === 'dls') {
      return dlsLinkURL;
    } else if (hierarchy === 'isis') {
      return isisLinkURL;
    } else {
      return genericLinkURL;
    }
  }, [hierarchy, isisLinkURL]);

  const hierarchyLink = React.useMemo(() => {
    if (hierarchy === 'dls') {
      const dlsLink = (
        investigationData: SearchResultSource
      ): React.ReactElement =>
        tableLink(
          dlsLinkURL(investigationData),
          investigationData.title as string
        );

      return dlsLink;
    } else if (hierarchy === 'isis') {
      return isisLink;
    } else {
      const genericLink = (
        investigationData: SearchResultSource
      ): React.ReactElement =>
        tableLink(
          genericLinkURL(investigationData),
          investigationData.title as string
        );

      return genericLink;
    }
  }, [hierarchy, isisLink]);

  const selectedRows = React.useMemo(
    () =>
      cartItems
        ?.filter(
          (cartItem) =>
            cartItem.entityType === 'investigation' &&
            // if select all is disabled, it's safe to just pass the whole cart as selectedRows
            (!selectAllSetting ||
              (aggregatedIds && aggregatedIds.includes(cartItem.entityId)))
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, selectAllSetting, aggregatedIds]
  );

  // hierarchy === 'isis' ? data : undefined is a 'hack' to only perform
  // the correct calculation queries for each facility
  const datasetCountQueries = useInvestigationsDatasetCount(
    hierarchy !== 'isis' ? aggregatedSource : undefined
  );
  const sizeQueries = useInvestigationSizes(
    hierarchy === 'isis' ? aggregatedSource : undefined
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        label: t('investigations.title'),
        dataKey: 'title',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as SearchResultSource;
          return hierarchyLink(investigationData);
        },
        disableSort: true,
      },
      {
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        disableSort: true,
      },
      {
        label: t('investigations.name'),
        dataKey: 'name',
        disableSort: true,
      },
      {
        label: t('investigations.doi'),
        dataKey: 'doi',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return externalSiteLink(
            `https://doi.org/${investigationData.doi}`,
            investigationData.doi,
            'investigation-search-table-doi-link'
          );
        },
        disableSort: true,
      },
      {
        label:
          hierarchy === 'isis'
            ? t('investigations.size')
            : t('investigations.dataset_count'),
        dataKey: hierarchy === 'isis' ? 'size' : 'datasetCount',
        cellContentRenderer: (cellProps: TableCellProps): number | string => {
          if (hierarchy === 'isis' && cellProps.rowData.fileSize) {
            return formatBytes(cellProps.rowData.fileSize);
          }
          const query =
            hierarchy === 'isis'
              ? sizeQueries[cellProps.rowIndex]
              : datasetCountQueries[cellProps.rowIndex];
          return formatCountOrSize(query, hierarchy === 'isis');
        },
        disableSort: true,
      },
      {
        label: t('investigations.instrument'),
        dataKey: 'investigationInstruments.instrument.fullName',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as SearchResultSource;
          const investigationInstrument =
            investigationData.investigationinstrument?.[0];
          return (
            investigationInstrument?.['instrument.fullName'] ??
            investigationInstrument?.['instrument.name'] ??
            ''
          );
        },
        disableSort: true,
      },
      {
        label: t('investigations.start_date'),
        dataKey: 'startDate',
        cellContentRenderer: (cellProps: TableCellProps) => {
          if (cellProps.cellData) {
            return new Date(cellProps.cellData).toLocaleDateString();
          }
        },
        disableSort: true,
      },
      {
        label: t('investigations.end_date'),
        dataKey: 'endDate',
        cellContentRenderer: (cellProps: TableCellProps) => {
          if (cellProps.cellData) {
            return new Date(cellProps.cellData).toLocaleDateString();
          }
        },
        disableSort: true,
      },
    ],
    [t, hierarchy, hierarchyLink, sizeQueries, datasetCountQueries]
  );

  const detailsPanel = React.useCallback(
    ({ rowData, detailsPanelResize }) => {
      if (hierarchy === 'isis') {
        const datasetsURL = hierarchyLinkURL(rowData as SearchResultSource);
        return (
          <ISISInvestigationDetailsPanel
            rowData={rowData}
            detailsPanelResize={detailsPanelResize}
            viewDatasets={
              datasetsURL
                ? (id: number) => {
                    push(datasetsURL);
                  }
                : undefined
            }
          />
        );
      } else if (hierarchy === 'dls') {
        return (
          <DLSVisitDetailsPanel
            rowData={rowData}
            detailsPanelResize={detailsPanelResize}
          />
        );
      } else {
        return (
          <InvestigationDetailsPanel
            rowData={rowData}
            detailsPanelResize={detailsPanelResize}
          />
        );
      }
    },
    [hierarchy, hierarchyLinkURL, push]
  );

  return (
    <div>
      {aborted ? (
        <Paper>
          <Typography align="center" variant="h6" component="h6">
            {t('loading.abort_message')}
          </Typography>
        </Paper>
      ) : (
        <Table
          loading={addToCartLoading || removeFromCartLoading}
          data={aggregatedSource}
          loadMoreRows={loadMoreRows}
          totalRowCount={aggregatedSource?.length + (hasNextPage ? 1 : 0) ?? 0}
          sort={{}}
          onSort={handleSort}
          detailsPanel={detailsPanel}
          columns={columns}
          {...(hierarchy !== 'dls' && {
            selectedRows,
            aggregatedIds,
            onCheck: addToCart,
            onUncheck: removeFromCart,
            disableSelectAll: !selectAllSetting,
          })}
          shortHeader={true}
        />
      )}
    </div>
  );
};

export default InvestigationSearchTable;
