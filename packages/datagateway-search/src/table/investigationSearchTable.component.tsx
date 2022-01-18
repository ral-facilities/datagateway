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
  Investigation,
  tableLink,
  externalSiteLink,
  FacilityCycle,
  ColumnType,
  DetailsPanelProps,
  parseSearchToQuery,
  useAddToCart,
  useAllFacilityCycles,
  useCart,
  useDateFilter,
  useIds,
  useInvestigationCount,
  useInvestigationsInfinite,
  useSort,
  useRemoveFromCart,
  useTextFilter,
  useInvestigationsDatasetCount,
  useInvestigationSizes,
  formatCountOrSize,
  useLuceneSearch,
  // FiltersType,
  // SortType,
} from 'datagateway-common';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { StateType } from '../state/app.types';
import { useSelector } from 'react-redux';

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

export const InvestigationDetailsPanel = (
  props: DetailsPanelProps
): React.ReactElement => {
  const classes = useStyles();
  const [t] = useTranslation();
  const investigationData = props.rowData as Investigation;
  return (
    <Grid
      id="details-panel"
      container
      className={classes.root}
      direction="column"
    >
      <Grid item xs>
        <Typography variant="h6">
          <b>{investigationData.title}</b>
        </Typography>
        <Divider className={classes.divider} />
      </Grid>
      <Grid item xs>
        <Typography variant="overline">
          {t('investigations.details.name')}
        </Typography>
        <Typography>
          <b>{investigationData.name}</b>
        </Typography>
      </Grid>
      <Grid item xs>
        <Typography variant="overline">
          {t('investigations.details.start_date')}
        </Typography>
        <Typography>
          <b>{investigationData.startDate}</b>
        </Typography>
      </Grid>
      <Grid item xs>
        <Typography variant="overline">
          {t('investigations.details.end_date')}
        </Typography>
        <Typography>
          <b>{investigationData.endDate}</b>
        </Typography>
      </Grid>
    </Grid>
  );
};

// const storeFilters = (filters: FiltersType): void => {
//   localStorage.setItem('investigaitonFilters', JSON.stringify(filters));
// };
// const storeSort = (sort: SortType): void => {
//   localStorage.setItem('investigationSort', JSON.stringify(sort));
// };

// const getFilters = (filters: FiltersType): string => {
//   // We store the view into localStorage so the user can
//   // return to the view they were on the next time they open the page.
//   const savedFilters = localStorage.getItem('investigationFilters');
//   const currentFilters = JSON.stringify(filters);

//   // We set to 'table' initially if there is none present.
//   if (!savedFilters) storeFilters(filters);
//   else return savedFilters;
//   return currentFilters;
// };

interface InvestigationTableProps {
  hierarchy: string;
}

const InvestigationSearchTable = (
  props: InvestigationTableProps
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

  const { data: luceneData } = useLuceneSearch('Investigation', {
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

  const { data: totalDataCount } = useInvestigationCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        id: { in: luceneData || [] },
      }),
    },
  ]);
  const { fetchNextPage, data } = useInvestigationsInfinite([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        id: { in: luceneData || [] },
      }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify({
        investigationInstruments: 'instrument',
      }),
    },
  ]);
  const { data: allIds } = useIds(
    'investigation',
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
  const { data: cartItems } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } = useAddToCart(
    'investigation'
  );
  const {
    mutate: removeFromCart,
    isLoading: removeFromCartLoading,
  } = useRemoveFromCart('investigation');

  const aggregatedData: Investigation[] = React.useMemo(
    () => (data ? ('pages' in data ? data.pages.flat() : data) : []),
    [data]
  );

  const textFilter = useTextFilter(filters, 'push');
  const dateFilter = useDateFilter(filters, 'push');
  const handleSort = useSort('push');
  // const replaceTextFilter = useTextFilter(filters, 'replace');
  // const replaceDateFilter = useDateFilter(filters, 'replace');
  // const replaceHandleSort = useSort('replace');
  // if (filters.length > 2) {
  //   storeFilters(filters);
  // }
  // if (sort !== {}) {
  //   storeSort(sort);
  // }

  //console.log('Find me', getFilters(filters));

  // React.useEffect(() => {
  //   // If the view query parameter was not found and the previously
  //   // stored view is in localstorage, update our current query with the view.
  //   const savedFilters = localStorage.getItem('investigationFilters');
  //   if (savedFilters) {
  //     console.log('pizzas', savedFilters);
  //     //Replace rather than push here to ensure going back doesn't just go to the same
  //     //page without the query which would execute this code again
  //     replaceTextFilter(savedFilters, JSON.parse(savedFilters));
  //     replaceDateFilter(savedFilters, JSON.parse(savedFilters));
  //   }
  // }, [location.pathname, replaceTextFilter, replaceDateFilter]);

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const dlsLink = (investigationData: Investigation): React.ReactElement =>
    tableLink(
      `/browse/proposal/${investigationData.name}/investigation/${investigationData.id}/dataset`,
      investigationData.title
    );

  const isisLink = React.useCallback(
    (investigationData: Investigation) => {
      let instrumentId;
      let facilityCycleId;
      if (investigationData.investigationInstruments?.length) {
        instrumentId =
          investigationData.investigationInstruments[0].instrument?.id;
      } else {
        return investigationData.title;
      }

      if (investigationData.startDate && facilityCycles?.length) {
        const filteredFacilityCycles: FacilityCycle[] = facilityCycles?.filter(
          (facilityCycle: FacilityCycle) =>
            investigationData.startDate &&
            facilityCycle.startDate &&
            facilityCycle.endDate &&
            investigationData.startDate >= facilityCycle.startDate &&
            investigationData.startDate <= facilityCycle.endDate
        );
        if (filteredFacilityCycles.length) {
          facilityCycleId = filteredFacilityCycles[0].id;
        }
      }

      if (facilityCycleId) {
        return tableLink(
          `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${investigationData.id}/dataset`,
          investigationData.title
        );
      } else {
        return investigationData.title;
      }
    },
    [facilityCycles]
  );

  const genericLink = (investigationData: Investigation): React.ReactElement =>
    tableLink(
      `/browse/investigation/${investigationData.id}/dataset`,
      investigationData.title
    );

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
            cartItem.entityType === 'investigation' &&
            // if select all is disabled, it's safe to just pass the whole cart as selectedRows
            (!selectAllSetting ||
              (allIds && allIds.includes(cartItem.entityId)))
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, selectAllSetting, allIds]
  );

  // hierarchy === 'isis' ? data : [] is a 'hack' to only perform
  // the correct calculation queries for each facility
  const datasetCountQueries = useInvestigationsDatasetCount(
    hierarchy !== 'isis' ? data : []
  );
  const sizeQueries = useInvestigationSizes(hierarchy === 'isis' ? data : []);

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        label: t('investigations.title'),
        dataKey: 'title',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return hierarchyLink(investigationData);
        },
        filterComponent: textFilter,
      },
      {
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        filterComponent: textFilter,
      },
      {
        label: t('investigations.name'),
        dataKey: 'name',
        filterComponent: textFilter,
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
        filterComponent: textFilter,
      },
      {
        label:
          hierarchy === 'isis'
            ? t('investigations.size')
            : t('investigations.dataset_count'),
        dataKey: hierarchy === 'isis' ? 'size' : 'datasetCount',
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
        label: t('investigations.instrument'),
        dataKey: 'investigationInstruments.instrument.fullName',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          if (investigationData?.investigationInstruments?.[0]?.instrument) {
            return investigationData.investigationInstruments[0].instrument
              .fullName;
          } else {
            return '';
          }
        },
        filterComponent: textFilter,
      },
      {
        label: t('investigations.start_date'),
        dataKey: 'startDate',
        filterComponent: dateFilter,
        cellContentRenderer: (cellProps: TableCellProps) => {
          if (cellProps.cellData) {
            return cellProps.cellData.toString().split(' ')[0];
          }
        },
      },
      {
        label: t('investigations.end_date'),
        dataKey: 'endDate',
        filterComponent: dateFilter,
        cellContentRenderer: (cellProps: TableCellProps) => {
          if (cellProps.cellData) {
            return cellProps.cellData.toString().split(' ')[0];
          }
        },
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
      onSort={handleSort}
      detailsPanel={InvestigationDetailsPanel}
      columns={columns}
      {...(hierarchy !== 'dls' && {
        selectedRows,
        allIds,
        onCheck: addToCart,
        onUncheck: removeFromCart,
        disableSelectAll: !selectAllSetting,
      })}
    />
  );
};

export default InvestigationSearchTable;
