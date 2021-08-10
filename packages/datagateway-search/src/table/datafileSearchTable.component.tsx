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
  formatBytes,
  Datafile,
  tableLink,
  FacilityCycle,
  ColumnType,
  Dataset,
  DetailsPanelProps,
  parseSearchToQuery,
  useAddToCart,
  useAllFacilityCycles,
  useCart,
  useDatafileCount,
  useDatafilesInfinite,
  useDateFilter,
  useIds,
  useLuceneSearch,
  usePushSort,
  useRemoveFromCart,
  useTextFilter,
} from 'datagateway-common';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { StateType } from '../state/app.types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';

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

const DatafileDetailsPanel = (props: DetailsPanelProps): React.ReactElement => {
  const classes = useStyles();
  const [t] = useTranslation();
  const datafileData = props.rowData as Datafile;
  return (
    <Grid
      id="details-panel"
      container
      className={classes.root}
      direction="column"
    >
      <Grid item xs>
        <Typography variant="h6">
          <b>{datafileData.name}</b>
        </Typography>
        <Divider className={classes.divider} />
      </Grid>
      <Grid item xs>
        <Typography variant="overline">{t('datafiles.size')}</Typography>
        <Typography>
          <b>{formatBytes(datafileData.fileSize)}</b>
        </Typography>
      </Grid>
      <Grid item xs>
        <Typography variant="overline">{t('datafiles.location')}</Typography>
        <Typography>
          <b>{datafileData.location}</b>
        </Typography>
      </Grid>
    </Grid>
  );
};

interface DatafileSearchTableProps {
  hierarchy: string;
}

const DatafileSearchTable = (
  props: DatafileSearchTableProps
): React.ReactElement => {
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
  const { data: luceneData } = useLuceneSearch('Investigation', {
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
  const { data: allIds } = useIds('datafile', [
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        id: { in: luceneData || [] },
      }),
    },
  ]);
  const { data: cartItems } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } = useAddToCart(
    'datafile'
  );
  const {
    mutate: removeFromCart,
    isLoading: removeFromCartLoading,
  } = useRemoveFromCart('datafile');

  const aggregatedData: Dataset[] = React.useMemo(
    () => data?.pages.flat() ?? [],
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
            allIds &&
            cartItem.entityType === 'datafile' &&
            allIds.includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, allIds]
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
      detailsPanel={DatafileDetailsPanel}
      columns={columns}
    />
  );
};

export default DatafileSearchTable;
