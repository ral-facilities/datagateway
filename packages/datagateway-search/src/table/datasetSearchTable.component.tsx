import React from 'react';
import {
  createStyles,
  Divider,
  Grid,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import {
  Table,
  Dataset,
  tableLink,
  FacilityCycle,
  ColumnType,
  DetailsPanelProps,
  formatCountOrSize,
  parseSearchToQuery,
  useAddToCart,
  useAllFacilityCycles,
  useCart,
  useDatasetCount,
  useDatasetsDatafileCount,
  useDatasetsInfinite,
  useDatasetSizes,
  useDateFilter,
  useIds,
  useLuceneSearch,
  usePushSort,
  useRemoveFromCart,
  useTextFilter,
} from 'datagateway-common';
import { StateType } from '../state/app.types';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
    },
    divider: {
      marginBottom: theme.spacing(2),
    },
  })
);

export const DatasetDetailsPanel = (
  props: DetailsPanelProps
): React.ReactElement => {
  const classes = useStyles();
  const [t] = useTranslation();
  const datasetData = props.rowData as Dataset;
  return (
    <Grid
      id="details-panel"
      container
      className={classes.root}
      direction="column"
    >
      <Grid item xs>
        <Typography variant="h6">
          <b>{datasetData.name}</b>
        </Typography>
        <Divider className={classes.divider} />
      </Grid>
      <Grid item xs>
        <Typography variant="overline">{t('datasets.description')}</Typography>
        <Typography>
          <b>{datasetData.description}</b>
        </Typography>
      </Grid>
    </Grid>
  );
};

interface DatasetTableProps {
  hierarchy: string;
}

const DatasetSearchTable = (props: DatasetTableProps): React.ReactElement => {
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
  const location = useLocation();
  const [t] = useTranslation();

  const { filters, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const { data: totalDataCount } = useDatasetCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        id: { in: luceneData || [] },
      }),
    },
  ]);
  const { fetchNextPage, data } = useDatasetsInfinite([
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
  const { data: allIds } = useIds('dataset', [
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        id: { in: luceneData || [] },
      }),
    },
  ]);
  const { data: cartItems } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } = useAddToCart(
    'dataset'
  );
  const {
    mutate: removeFromCart,
    isLoading: removeFromCartLoading,
  } = useRemoveFromCart('dataset');

  const aggregatedData: Dataset[] = React.useMemo(
    () => (data ? ('pages' in data ? data.pages.flat() : data) : []),
    [data]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const pushSort = usePushSort();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

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

  const selectedRows = React.useMemo(
    () =>
      cartItems
        ?.filter(
          (cartItem) =>
            allIds &&
            cartItem.entityType === 'dataset' &&
            allIds.includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, allIds]
  );

  // hierarchy === 'isis' ? data : [] is a 'hack' to only perform
  // the correct calculation queries for each facility
  const datasetCountQueries = useDatasetsDatafileCount(
    hierarchy !== 'isis' ? data : []
  );
  const sizeQueries = useDatasetSizes(hierarchy === 'isis' ? data : []);

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        label: t('datasets.name'),
        dataKey: 'name',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const datasetData = cellProps.rowData as Dataset;
          return hierarchyLink(datasetData);
        },
        filterComponent: textFilter,
      },
      {
        label:
          hierarchy === 'isis'
            ? t('datasets.size')
            : t('datasets.datafile_count'),
        dataKey: hierarchy === 'isis' ? 'size' : 'datafileCount',
        cellContentRenderer: (cellProps: TableCellProps): number | string => {
          const query =
            hierarchy === 'isis'
              ? sizeQueries[cellProps.rowIndex]
              : datasetCountQueries[cellProps.rowIndex];
          return formatCountOrSize(query, hierarchy === 'isis');
        },
        disableSort: true,
      },
      {
        label: t('datasets.investigation'),
        dataKey: 'investigation.title',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const datasetData = cellProps.rowData as Dataset;
          return hierarchyLink(datasetData, 'investigation');
        },
        filterComponent: textFilter,
      },
      {
        label: t('datasets.create_time'),
        dataKey: 'createTime',
        filterComponent: dateFilter,
      },
      {
        label: t('datasets.modified_time'),
        dataKey: 'modTime',
        filterComponent: dateFilter,
      },
    ],
    [
      t,
      textFilter,
      hierarchy,
      dateFilter,
      hierarchyLink,
      sizeQueries,
      datasetCountQueries,
    ]
  );

  return (
    <Table
      loading={addToCartLoading || removeFromCartLoading}
      data={aggregatedData}
      loadMoreRows={loadMoreRows}
      totalRowCount={totalDataCount ?? 0}
      sort={sort}
      onSort={pushSort}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      detailsPanel={DatasetDetailsPanel}
      columns={columns}
    />
  );
};

export default DatasetSearchTable;
