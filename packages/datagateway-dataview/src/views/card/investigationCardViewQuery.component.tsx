import { Button } from '@material-ui/core';
import {
  AddCircleOutlineOutlined,
  CalendarToday,
  ConfirmationNumber,
  Fingerprint,
  Public,
  RemoveCircleOutlineOutlined,
} from '@material-ui/icons';
import {
  addToCart,
  CardViewQuery,
  DateColumnFilter,
  DateFilter,
  DownloadCartItem,
  Filter,
  Investigation,
  investigationLink,
  removeFromCart,
  TextColumnFilter,
  TextFilter,
  readURLQuery,
  Order,
  getURLQuery,
  readURLQuerySearch,
  FiltersType,
  SortType,
  readSciGatewayToken,
  getApiParams,
  Entity,
  nestedValue,
  StateType,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { IndexRange } from 'react-virtualized';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { useHistory, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';

interface InvestigationCVDispatchProps {
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
}

interface InvestigationCVStateProps {
  cartItems: DownloadCartItem[];
}

type InvestigationCVCombinedProps = InvestigationCVDispatchProps &
  InvestigationCVStateProps;

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

export const fetchFilter = (
  entityType: 'investigation' | 'dataset' | 'datafile',
  filterKey: string,
  additionalFilters?: {
    filterType: 'where' | 'distinct' | 'include';
    filterValue: string;
  }[],
  // NOTE: Support for nested values by providing a dataKey for API request
  //       which differs from filter key used in code.
  dataKey?: string
): Promise<string[]> => {
  const params = new URLSearchParams();
  // Allow for other additional filters to be applied.
  if (additionalFilters) {
    additionalFilters.forEach((filter) => {
      params.append(filter.filterType, filter.filterValue);
    });
  }

  // Add in the distinct if it as not already been added.
  const distinctFilterString = params.get('distinct');
  // Use the dataKey if provided, this allows for nested items
  // to be read as requesting them from the API maybe in a different format.
  // i.e. investigationInstruments[0].instrument maybe requested as investigationInstruments.instrument
  const filterValue = dataKey ? dataKey : filterKey;
  if (distinctFilterString) {
    const distinctFilter: string | string[] = JSON.parse(distinctFilterString);
    if (typeof distinctFilter === 'string') {
      params.set('distinct', JSON.stringify([distinctFilter, filterValue]));
    } else {
      params.set('distinct', JSON.stringify([...distinctFilter, filterValue]));
    }
  } else {
    params.set('distinct', JSON.stringify(filterValue));
  }

  const apiUrl = 'https://scigateway-preprod.esc.rl.ac.uk/datagateway-api';

  return axios
    .get<Entity[]>(`${apiUrl}/${entityType}s`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data.map((x) => nestedValue(x, filterKey));
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

const InvestigationCardViewQuery = (
  props: InvestigationCVCombinedProps
): React.ReactElement => {
  const { cartItems, addToCart, removeFromCart } = props;

  const [t] = useTranslation();
  const history = useHistory();
  const location = useLocation();

  const { filters, view, sort, page, results } = React.useMemo(
    () => readURLQuery(location),
    [location]
  );

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      value={filters[dataKey] as TextFilter}
      onChange={(value: { value?: string | number; type: string } | null) =>
        pushFilters(dataKey, value ? value : null)
      }
    />
  );

  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <DateColumnFilter
      label={label}
      value={filters[dataKey] as DateFilter}
      onChange={(value: { startDate?: string; endDate?: string } | null) =>
        pushFilters(dataKey, value ? value : null)
      }
    />
  );

  const pushSort = React.useCallback(
    (sortKey: string, order: Order | null): void => {
      let query = readURLQuerySearch(history.location.search);
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
    [history]
  );

  const pushFilters = React.useCallback(
    (filterKey: string, filter: Filter | null): void => {
      let query = readURLQuerySearch(history.location.search);
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
    [history]
  );

  const pushPage = React.useCallback(
    (page: number): void => {
      const query = {
        ...readURLQuerySearch(history.location.search),
        page,
      };
      history.push(`?${getURLQuery(query).toString()}`);
    },
    [history]
  );

  const pushResults = React.useCallback(
    (results: number): void => {
      const query = {
        ...readURLQuerySearch(history.location.search),
        results,
      };
      history.push(`?${getURLQuery(query).toString()}`);
    },
    [history]
  );

  const { isLoading: countLoading, data: totalDataCount } = useQuery<
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

  const { isLoading: dataLoading, data } = useQuery<
    Investigation[],
    Error,
    Investigation[],
    [
      string,
      {
        sort: SortType;
        filters: FiltersType;
        page: number;
        results: number | null;
      }
    ]
  >(
    [
      'investigation',
      { sort, filters, page: page || 1, results: results || 10 },
    ],
    (params) => {
      const { sort, filters, page, results } = params.queryKey[1];
      const startIndex = (page - 1) * (results ?? 10);
      const stopIndex = startIndex + (results ?? 10) - 1;
      return fetchData({ sort, filters }, { startIndex, stopIndex });
    }
  );

  const { data: typeIds } = useQuery<
    string[],
    Error,
    string[],
    ['investigation' | 'dataset' | 'datafile', string]
  >(['investigation', 'type.id'], ({ queryKey }) =>
    fetchFilter(queryKey[0], queryKey[1], [])
  );

  const { data: facilityIds } = useQuery<
    string[],
    Error,
    string[],
    ['investigation' | 'dataset' | 'datafile', string]
  >(['investigation', 'facility.id'], ({ queryKey }) =>
    fetchFilter(queryKey[0], queryKey[1], [])
  );

  // Get the selected cards.
  const selectedCards = React.useMemo(
    () =>
      cartItems
        .filter(
          (cartItem) =>
            cartItem.entityType === 'investigation' &&
            data
              ?.map((investigation) => investigation.id)
              .includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, data]
  );

  return (
    <CardViewQuery
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
      title={{
        // Provide label for filter component.
        label: t('investigations.title'),
        // Provide both the dataKey (for tooltip) and content to render.
        dataKey: 'title',
        content: (investigation: Investigation) => {
          return investigationLink(investigation.id, investigation.title, view);
        },
        filterComponent: textFilter,
      }}
      description={{
        label: t('investigations.details.summary'),
        dataKey: 'summary',
        filterComponent: textFilter,
      }}
      information={[
        {
          icon: <Public />,
          label: t('investigations.doi'),
          dataKey: 'doi',
          filterComponent: textFilter,
        },
        {
          icon: <Fingerprint />,
          label: t('investigations.visit_id'),
          dataKey: 'visitId',
          filterComponent: textFilter,
        },
        {
          icon: <Fingerprint />,
          label: t('investigations.details.rb_number'),
          dataKey: 'rbNumber',
          filterComponent: textFilter,
          disableSort: true,
        },
        {
          icon: <ConfirmationNumber />,
          label: t('investigations.dataset_count'),
          dataKey: 'datasetCount',
          filterComponent: textFilter,
          disableSort: true,
        },
        {
          icon: <CalendarToday />,
          label: t('investigations.details.start_date'),
          dataKey: 'startDate',
          filterComponent: dateFilter,
        },
        {
          icon: <CalendarToday />,
          label: t('investigations.details.end_date'),
          dataKey: 'endDate',
          filterComponent: dateFilter,
        },
      ]}
      buttons={[
        function cartButton(investigation: Investigation) {
          return !(
            selectedCards && selectedCards.includes(investigation.id)
          ) ? (
            <Button
              id="add-to-cart-btn"
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineOutlined />}
              disableElevation
              onClick={() => addToCart([investigation.id])}
            >
              Add to cart
            </Button>
          ) : (
            <Button
              id="remove-from-cart-btn"
              variant="contained"
              color="secondary"
              startIcon={<RemoveCircleOutlineOutlined />}
              disableElevation
              onClick={() => {
                if (selectedCards && selectedCards.includes(investigation.id))
                  removeFromCart([investigation.id]);
              }}
            >
              Remove from cart
            </Button>
          );
        },
      ]}
      // If was a specific dataKey on the custom filter request,
      // use that over the filterKey here.
      customFilters={[
        {
          label: t('investigations.type.id'),
          dataKey: 'type.id',
          filterItems: typeIds ?? [],
        },
        {
          label: t('investigations.facility.id'),
          dataKey: 'facility.id',
          filterItems: facilityIds ?? [],
        },
      ]}
    />
  );
};

const mapStateToProps = (state: StateType): InvestigationCVStateProps => {
  return {
    cartItems: state.dgcommon.cartItems,
  };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): InvestigationCVDispatchProps => ({
  addToCart: (entityIds: number[]) =>
    dispatch(addToCart('investigation', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('investigation', entityIds)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InvestigationCardViewQuery);
