import React from 'react';
import {
  Typography,
  Grid,
  createStyles,
  makeStyles,
  Theme,
  Divider,
} from '@material-ui/core';
import {
  Table,
  TextColumnFilter,
  TextFilter,
  DateColumnFilter,
  investigationLink,
  Order,
  Filter,
  Investigation,
  DateFilter,
  readURLQuery,
  SortType,
  FiltersType,
  getApiParams,
  readSciGatewayToken,
  formatBytes,
  readURLQuerySearch,
  getURLQuery,
  addToCartQuery,
  removeFromCartQuery,
  fetchDownloadCartQuery,
  ColumnType,
} from 'datagateway-common';
import { StateType } from '../../state/app.types';
import { useSelector } from 'react-redux';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useHistory, useLocation } from 'react-router-dom';

import TitleIcon from '@material-ui/icons/Title';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import PublicIcon from '@material-ui/icons/Public';
import SaveIcon from '@material-ui/icons/Save';
import AssessmentIcon from '@material-ui/icons/Assessment';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  // useQueries,
  // UseInfiniteQueryResult,
  // InfiniteData,
} from 'react-query';
// import pLimit from 'p-limit';

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

const fetchData = (
  sortAndFilters: {
    sort: SortType;
    filters: FiltersType;
  },
  offsetParams?: IndexRange
): Promise<Investigation[]> => {
  const params = getApiParams(sortAndFilters);
  const apiUrl = 'https://scigateway-preprod.esc.rl.ac.uk/datagateway-api';

  if (offsetParams) {
    params.append('skip', JSON.stringify(offsetParams.startIndex));
    params.append(
      'limit',
      JSON.stringify(offsetParams.stopIndex - offsetParams.startIndex + 1)
    );
  }

  return axios
    .get(`${apiUrl}/investigations`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const fetchInvestigationSize = (
  investigationId: number
): Promise<number> => {
  // Make use of the facility name and download API url for the request.
  const facilityName = 'LILS';
  const downloadApiUrl = 'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat';
  return axios
    .get(`${downloadApiUrl}/user/getSize`, {
      params: {
        sessionId: readSciGatewayToken().sessionId,
        facilityName: facilityName,
        entityType: 'investigation',
        entityId: investigationId,
      },
    })
    .then((response) => {
      return response.data;
    });
};

const fetchCount = (filters: FiltersType): Promise<number> => {
  const params = getApiParams({ filters, sort: {} });
  const apiUrl = 'https://scigateway-preprod.esc.rl.ac.uk/datagateway-api';

  return axios
    .get(`${apiUrl}/investigations/count`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => response.data);
};

export const fetchIds = (
  filters: FiltersType,
  entityType: 'investigation' | 'dataset' | 'datafile',
  additionalFilters?: {
    filterType: 'where' | 'distinct' | 'include';
    filterValue: string;
  }[]
): Promise<number[]> => {
  const params = getApiParams({ filters, sort: {} });
  const apiUrl = 'https://scigateway-preprod.esc.rl.ac.uk/datagateway-api';

  if (additionalFilters) {
    additionalFilters.forEach((filter) => {
      params.append(filter.filterType, filter.filterValue);
    });
  }

  const distinctFilterString = params.get('distinct');
  if (distinctFilterString) {
    const distinctFilter: string | string[] = JSON.parse(distinctFilterString);
    if (typeof distinctFilter === 'string') {
      params.set('distinct', JSON.stringify([distinctFilter, 'id']));
    } else {
      params.set('distinct', JSON.stringify([...distinctFilter, 'id']));
    }
  } else {
    params.set('distinct', JSON.stringify('id'));
  }

  return axios
    .get<{ id: number }[]>(`${apiUrl}/${entityType}s`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data.map((x) => x.id);
    });
};

const InvestigationTableQuery = (): React.ReactElement => {
  const selectAllSetting = useSelector(
    (state: StateType) => state.dgdataview.selectAllSetting
  );
  const history = useHistory();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [t] = useTranslation();

  // const throttle = pThrottle({ limit: 5, interval: 500 });
  // const limit = pLimit(5);

  // React.useEffect(() => {
  //   return () => {
  //     limit.clearQueue();
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const pushSort = React.useCallback(
    (sortKey: string, order: Order | null): void => {
      let query = readURLQuerySearch(location.search);
      if (order !== null) {
        query = {
          ...query,
          sort: {
            ...query.sort,
            [sortKey]: order,
          },
        };
      } else {
        // if order is null, user no longer wants to sort by that column so remove column from sort state
        const { [sortKey]: order, ...rest } = query.sort;
        query = {
          ...query,
          sort: {
            ...rest,
          },
        };
      }
      history.push({ search: `?${getURLQuery(query).toString()}` });
    },
    [history, location]
  );

  const pushFilters = React.useCallback(
    (filterKey: string, filter: Filter | null): void => {
      let query = readURLQuerySearch(location.search);
      if (filter !== null) {
        // if given an defined filter, update the relevant column in the sort state
        query = {
          ...query,
          filters: {
            ...query.filters,
            [filterKey]: filter,
          },
        };
      } else {
        // if filter is null, user no longer wants to filter by that column so remove column from filter state
        const { [filterKey]: filter, ...rest } = query.filters;
        query = {
          ...query,
          filters: {
            ...rest,
          },
        };
      }
      history.push({ search: `?${getURLQuery(query).toString()}` });
    },
    [history, location]
  );

  const classes = useStyles();

  const { filters, view, sort } = React.useMemo(() => readURLQuery(location), [
    location,
  ]);

  const { data: totalDataCount } = useQuery<
    number,
    Error,
    number,
    [string, { filters: FiltersType }]
  >(
    ['investigationCount', { filters }],
    (params) => {
      const { filters } = params.queryKey[1];
      return fetchCount(filters);
    },
    { placeholderData: 0 }
  );

  const { fetchNextPage, data } = useInfiniteQuery<
    Investigation[],
    Error,
    Investigation[],
    [string, { sort: SortType; filters: FiltersType }]
  >(
    ['investigation', { sort, filters }],
    (params) => {
      const { sort, filters } = params.queryKey[1];
      const offsetParams = params.pageParam ?? { startIndex: 0, stopIndex: 49 };
      return fetchData({ sort, filters }, offsetParams);
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length >= 25) {
          return true;
        } else {
          return undefined;
        }
      },
    }
  );

  // go through the data array and fetch sizes
  // useQueries(
  //   aggregatedData.map((investigation) => {
  //     return {
  //       queryKey: ['investigationSize', investigation.id],
  //       queryFn: () => limit(fetchInvestigationSize, investigation.id),
  //       onSuccess: (data) => {
  //         queryClient.setQueryData<InfiniteData<Investigation[]>>(
  //           ['investigation', { sort, filters }],
  //           (oldData) => {
  //             return {
  //               ...oldData,
  //               pageParams: oldData?.pageParams ?? [],
  //               pages:
  //                 oldData?.pages.map((page) =>
  //                   page.map((oldInvestigation) => {
  //                     return oldInvestigation.id === investigation.id
  //                       ? { ...oldInvestigation, size: data as number }
  //                       : oldInvestigation;
  //                   })
  //                 ) ?? [],
  //             };
  //           }
  //         );
  //       },
  //       staleTime: Infinity,
  //     };
  //   }) ?? []
  // );

  const { data: allIds } = useQuery<
    number[],
    Error,
    number[],
    [string, { filters: FiltersType }]
  >(['investigationIds', { filters }], (params) => {
    const { filters } = params.queryKey[1];
    return fetchIds(filters, 'investigation');
  });

  const { data: cartItems } = useQuery('cart', () =>
    fetchDownloadCartQuery({
      facilityName: 'LILS',
      downloadApiUrl: 'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat',
    })
  );

  const { mutate: addToCart, isLoading: addToCartLoading } = useMutation(
    (entityIds: number[]) =>
      addToCartQuery('investigation', entityIds, {
        facilityName: 'LILS',
        downloadApiUrl: 'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat',
      }),
    {
      onSuccess: (data) => {
        queryClient.setQueryData('cart', data);
      },
    }
  );

  const {
    mutate: removeFromCart,
    isLoading: removeFromCartLoading,
  } = useMutation(
    (entityIds: number[]) =>
      removeFromCartQuery('investigation', entityIds, {
        facilityName: 'LILS',
        downloadApiUrl: 'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat',
      }),
    {
      onSuccess: (data) => {
        queryClient.setQueryData('cart', data);
      },
    }
  );

  const selectedRows = React.useMemo(
    () =>
      cartItems
        ?.filter(
          (cartItem) =>
            allIds &&
            cartItem.entityType === 'investigation' &&
            allIds.includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, allIds]
  );

  const aggregatedData: Investigation[] = React.useMemo(
    () => data?.pages.flat() ?? [],
    [data]
  );

  const textFilter = React.useMemo(() => {
    const TextFilter = (label: string, dataKey: string): React.ReactElement => (
      <TextColumnFilter
        label={label}
        value={filters[dataKey] as TextFilter}
        onChange={(value: { value?: string | number; type: string } | null) =>
          pushFilters(dataKey, value ? value : null)
        }
      />
    );
    return TextFilter;
  }, [filters, pushFilters]);

  const dateFilter = React.useMemo(() => {
    const DateFilter = (label: string, dataKey: string): React.ReactElement => (
      <DateColumnFilter
        label={label}
        value={filters[dataKey] as DateFilter}
        onChange={(value: { startDate?: string; endDate?: string } | null) =>
          pushFilters(dataKey, value ? value : null)
        }
      />
    );
    return DateFilter;
  }, [filters, pushFilters]);

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: <TitleIcon />,
        label: t('investigations.title'),
        dataKey: 'title',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return investigationLink(
            investigationData.id,
            investigationData.title,
            view
          );
        },
        filterComponent: textFilter,
      },
      {
        icon: <FingerprintIcon />,
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        filterComponent: textFilter,
      },
      {
        icon: <FingerprintIcon />,
        label: t('investigations.rb_number'),
        dataKey: 'rbNumber',
        filterComponent: textFilter,
        disableSort: true,
      },
      {
        icon: <PublicIcon />,
        label: t('investigations.doi'),
        dataKey: 'doi',
        filterComponent: textFilter,
      },
      {
        icon: <SaveIcon />,
        label: t('investigations.size'),
        dataKey: 'size',
        cellContentRenderer: (cellProps) => {
          return formatBytes(cellProps.cellData);
        },
        disableSort: true,
      },
      {
        icon: <AssessmentIcon />,
        label: t('investigations.instrument'),
        dataKey: 'instrument.name',
        filterComponent: textFilter,
      },
      {
        icon: <CalendarTodayIcon />,

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
        icon: <CalendarTodayIcon />,
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
    [t, dateFilter, textFilter, view]
  );

  return (
    <Table
      loading={addToCartLoading || removeFromCartLoading}
      data={aggregatedData}
      loadMoreRows={loadMoreRows}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={pushSort}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      disableSelectAll={!selectAllSetting}
      detailsPanel={({ rowData }) => {
        const investigationData = rowData as Investigation;
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
                {t('investigations.details.rb_number')}
              </Typography>
              <Typography>
                <b>{investigationData.rbNumber}</b>
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
      }}
      columns={columns}
    />
  );
};

// these all need to be converted to dgcommon

export default InvestigationTableQuery;
