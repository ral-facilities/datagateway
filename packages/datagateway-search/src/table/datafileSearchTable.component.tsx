import React from 'react';
import {
  Table,
  formatBytes,
  Datafile,
  tableLink,
  FacilityCycle,
  ColumnType,
  Dataset,
  parseSearchToQuery,
  useAddToCart,
  useAllFacilityCycles,
  useCart,
  useDatafileCount,
  useDatafilesInfinite,
  useDateFilter,
  useIds,
  useLuceneSearch,
  useSort,
  useRemoveFromCart,
  useTextFilter,
  DatafileDetailsPanel,
  ISISDatafileDetailsPanel,
  DLSDatafileDetailsPanel,
} from 'datagateway-common';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { StateType } from '../state/app.types';

interface DatafileSearchTableProps {
  hierarchy: string;
}

const DatafileSearchTable = (
  props: DatafileSearchTableProps
): React.ReactElement => {
  const { hierarchy } = props;

  const { data: facilityCycles } = useAllFacilityCycles(hierarchy === 'isis');

  const location = useLocation();
  const queryParams = React.useMemo(() => parseSearchToQuery(location.search), [
    location.search,
  ]);
  const { startDate, endDate } = queryParams;
  const searchText = queryParams.searchText ? queryParams.searchText : '';

  const selectAllSetting = useSelector(
    (state: StateType) => state.dgsearch.selectAllSetting
  );

  const maxNumResults = useSelector(
    (state: StateType) => state.dgsearch.maxNumResults
  );

  const { data: luceneData } = useLuceneSearch('Datafile', {
    searchText,
    startDate,
    endDate,
    maxCount: maxNumResults,
  });
  const [t] = useTranslation();

  const { filters, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const { data: totalDataCount } = useDatafileCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        id: { in: luceneData || [] },
      }),
    },
  ]);
  const { fetchNextPage, data } = useDatafilesInfinite([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        id: { in: luceneData || [] },
      }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify({
        dataset: { investigation: { investigationInstruments: 'instrument' } },
      }),
    },
  ]);
  const { data: allIds, isLoading: allIdsLoading } = useIds(
    'datafile',
    [
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          id: { in: luceneData || [] },
        }),
      },
    ],
    selectAllSetting
  );
  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } = useAddToCart(
    'datafile'
  );
  const {
    mutate: removeFromCart,
    isLoading: removeFromCartLoading,
  } = useRemoveFromCart('datafile');

  /* istanbul ignore next */
  const aggregatedData: Dataset[] = React.useMemo(() => {
    if (data) {
      if ('pages' in data) {
        return data.pages.flat();
      } else if (data instanceof Array) {
        return data;
      }
    }

    return [];
  }, [data]);

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const handleSort = useSort();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const dlsLink = (
    datafileData: Datafile,
    linkType = 'datafile'
  ): React.ReactElement | string => {
    if (datafileData.dataset?.investigation) {
      return linkType === 'dataset'
        ? tableLink(
            `/browse/proposal/${datafileData.dataset.investigation.name}/investigation/${datafileData.dataset.investigation?.id}/dataset/${datafileData.dataset.id}/datafile`,
            datafileData.dataset.name
          )
        : tableLink(
            `/browse/proposal/${datafileData.dataset.name}/investigation/${datafileData.dataset.investigation.id}/dataset/${datafileData.dataset.id}/datafile`,
            datafileData.name
          );
    }
    if (linkType === 'dataset')
      return datafileData.dataset ? datafileData.dataset.name : '';
    return datafileData.name;
  };

  const isisLink = React.useCallback(
    (datafileData: Datafile, linkType = 'datafile') => {
      let instrumentId;
      let facilityCycleId;
      if (
        datafileData.dataset?.investigation?.investigationInstruments?.length
      ) {
        instrumentId =
          datafileData.dataset?.investigation?.investigationInstruments[0]
            .instrument?.id;
      } else {
        if (linkType === 'dataset')
          return datafileData.dataset ? datafileData.dataset.name : '';
        return datafileData.name;
      }

      if (
        facilityCycles?.length &&
        datafileData.dataset?.investigation?.startDate
      ) {
        const filteredFacilityCycles: FacilityCycle[] = facilityCycles?.filter(
          (facilityCycle: FacilityCycle) =>
            datafileData.dataset?.investigation?.startDate &&
            facilityCycle.startDate &&
            facilityCycle.endDate &&
            datafileData.dataset.investigation.startDate >=
              facilityCycle.startDate &&
            datafileData.dataset.investigation.startDate <=
              facilityCycle.endDate
        );
        if (filteredFacilityCycles.length) {
          facilityCycleId = filteredFacilityCycles[0].id;
        }
      }

      if (facilityCycleId) {
        return linkType === 'dataset'
          ? tableLink(
              `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${datafileData.dataset.investigation.id}/dataset/${datafileData.dataset.id}`,
              datafileData.dataset.name
            )
          : tableLink(
              `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${datafileData.dataset.investigation.id}/dataset/${datafileData.dataset.id}/datafile`,
              datafileData.name
            );
      }
      return linkType === 'dataset' ? '' : datafileData.name;
    },
    [facilityCycles]
  );

  const genericLink = (
    datafileData: Datafile,
    linkType = 'datafile'
  ): React.ReactElement | string => {
    if (datafileData.dataset?.investigation) {
      return linkType === 'dataset'
        ? tableLink(
            `/browse/investigation/${datafileData.dataset.investigation.id}/dataset/${datafileData.dataset.id}/datafile`,
            datafileData.dataset.name
          )
        : tableLink(
            `/browse/investigation/${datafileData.dataset.investigation.id}/dataset/${datafileData.dataset.id}/datafile`,
            datafileData.name
          );
    }
    if (linkType === 'dataset')
      return datafileData.dataset ? datafileData.dataset.name : '';
    return datafileData.name;
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

  const selectedRows = React.useMemo(
    () =>
      cartItems
        ?.filter(
          (cartItem) =>
            cartItem.entityType === 'datafile' &&
            // if select all is disabled, it's safe to just pass the whole cart as selectedRows
            (!selectAllSetting ||
              (allIds && allIds.includes(cartItem.entityId)))
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, selectAllSetting, allIds]
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        label: t('datafiles.name'),
        dataKey: 'name',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const datafileData = cellProps.rowData as Datafile;
          return hierarchyLink(datafileData);
        },
        filterComponent: textFilter,
      },
      {
        label: t('datafiles.location'),
        dataKey: 'location',
        filterComponent: textFilter,
      },
      {
        label: t('datafiles.size'),
        dataKey: 'fileSize',
        cellContentRenderer: (cellProps) => {
          return formatBytes(cellProps.cellData);
        },
      },
      {
        label: t('datafiles.dataset'),
        dataKey: 'dataset.name',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const datafileData = cellProps.rowData as Datafile;
          return hierarchyLink(datafileData, 'dataset');
        },
        filterComponent: textFilter,
      },
      {
        label: t('datafiles.modified_time'),
        dataKey: 'modTime',
        filterComponent: dateFilter,
      },
    ],
    [t, textFilter, dateFilter, hierarchyLink]
  );

  let detailsPanel = DatafileDetailsPanel;
  if (hierarchy === 'isis') detailsPanel = ISISDatafileDetailsPanel;
  else if (hierarchy === 'dls') detailsPanel = DLSDatafileDetailsPanel;

  return (
    <Table
      loading={
        addToCartLoading ||
        removeFromCartLoading ||
        cartLoading ||
        allIdsLoading
      }
      data={aggregatedData}
      loadMoreRows={loadMoreRows}
      totalRowCount={totalDataCount ?? 0}
      sort={sort}
      onSort={handleSort}
      selectedRows={selectedRows}
      disableSelectAll={!selectAllSetting}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      detailsPanel={detailsPanel}
      columns={columns}
    />
  );
};

export default DatafileSearchTable;
