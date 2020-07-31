import { Button } from '@material-ui/core';
import {
  AddCircleOutlineOutlined,
  RemoveCircleOutlineOutlined,
  Public,
  Fingerprint,
  CalendarToday,
  ConfirmationNumber,
} from '@material-ui/icons';
import {
  addToCart,
  DownloadCartItem,
  Entity,
  fetchFilter,
  fetchInvestigationCount,
  fetchInvestigations,
  Investigation,
  investigationLink,
  removeFromCart,
  FiltersType,
  TextColumnFilter,
  DateColumnFilter,
  pushPageFilter,
  Filter,
  DateFilter,
  Order,
  pushPageSort,
  pushPageResults,
  clearData,
  pushPageNum,
  SortType,
} from 'datagateway-common';
import {
  FilterDataType,
  StateType,
  ViewsType,
  QueryParams,
} from 'datagateway-common/lib/state/app.types';
import React from 'react';
import { connect } from 'react-redux';
import { IndexRange } from 'react-virtualized';
import { AnyAction, Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import CardView from './cardView.component';

interface InvestigationCVDispatchProps {
  fetchData: (offsetParams: IndexRange) => Promise<void>;
  fetchCount: () => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchTypeFilter: () => Promise<void>;
  fetchFacilityFilter: () => Promise<void>;
  pushPage: (page: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  pushResults: (results: number) => Promise<void>;
  pushSort: (sort: string, order: Order | null) => Promise<void>;
  clearData: () => Action;
}

interface InvestigationCVStateProps {
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  query: QueryParams;
  sort: SortType;
  filters: FiltersType;
  filterData: FilterDataType;
  cartItems: DownloadCartItem[];
  view: ViewsType;
}

type InvestigationCVCombinedProps = InvestigationCVDispatchProps &
  InvestigationCVStateProps;

const InvestigationCardView = (
  props: InvestigationCVCombinedProps
): React.ReactElement => {
  const {
    data,
    totalDataCount,
    loading,
    query,
    sort,
    filters,
    filterData,
    cartItems,
    pushPage,
    pushResults,
    pushFilters,
    pushSort,
    clearData,
    fetchData,
    fetchCount,
    fetchTypeFilter,
    fetchFacilityFilter,
    addToCart,
    removeFromCart,
    view,
  } = props;

  const [fetchedCount, setFetchedCount] = React.useState(false);
  const [fetchedFilters, setFetchedFilters] = React.useState(false);
  const [investigationIds, setInvestigationIds] = React.useState<number[]>([]);

  // Get the distinct 'TYPE_ID' options.
  const typeFilteredItems = React.useMemo(
    () => ('TYPE_ID' in filterData ? filterData['TYPE_ID'] : []),
    [filterData]
  );

  // Get the distinct 'FACILITY_ID' options.
  const facilityFilteredItems = React.useMemo(
    () => ('FACILITY_ID' in filterData ? filterData['FACILITY_ID'] : []),
    [filterData]
  );

  // Get the selected cards.
  const selectedCards = React.useMemo(
    () =>
      cartItems
        .filter(
          (cartItem) =>
            cartItem.entityType === 'investigation' &&
            investigationIds.includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, investigationIds]
  );

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      value={filters[dataKey] as string}
      onChange={(value: string) => pushFilters(dataKey, value ? value : null)}
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

  React.useEffect(() => {
    // Set the IDs of the data.
    setInvestigationIds(data.map((investigation) => investigation.ID));

    // Fetch count.
    if (!fetchedCount) {
      fetchCount();
      setFetchedCount(true);
    }

    // Fetch the filter data.
    if (!fetchedFilters) {
      fetchTypeFilter();
      fetchFacilityFilter();
      setFetchedFilters(true);
    }
  }, [
    data,
    fetchedCount,
    fetchCount,
    fetchedFilters,
    fetchTypeFilter,
    fetchFacilityFilter,
  ]);

  return (
    // TODO: Since CardView is a separate component, we should not couple the data from redux to it,
    //       pass it through here.
    // TODO: Pass in card widths, sort/filters.
    <CardView
      data={data}
      totalDataCount={totalDataCount}
      loading={loading}
      sort={sort}
      filters={filters}
      query={query}
      loadData={fetchData}
      loadCount={fetchCount}
      onPageChange={pushPage}
      onResultsChange={pushResults}
      onSort={pushSort}
      onFilter={pushFilters}
      clearData={clearData}
      title={{
        // Provide label for filter component.
        label: 'Title',
        // Provide both the dataKey (for tooltip) and content to render.
        dataKey: 'TITLE',
        content: (investigation: Investigation) => {
          return investigationLink(investigation.ID, investigation.TITLE, view);
        },
        filterComponent: textFilter,
      }}
      description={{
        label: 'Description',
        dataKey: 'SUMMARY',
        filterComponent: textFilter,
      }}
      information={[
        {
          icon: <Public />,
          label: 'DOI',
          dataKey: 'DOI',
          filterComponent: textFilter,
        },
        {
          icon: <Fingerprint />,
          label: 'Visit ID',
          dataKey: 'VISIT_ID',
          filterComponent: textFilter,
        },
        {
          icon: <Fingerprint />,
          label: 'RB Number',
          dataKey: 'RB_NUMBER',
          filterComponent: textFilter,
        },
        {
          icon: <ConfirmationNumber />,
          label: 'Dataset Count',
          dataKey: 'DATASET_COUNT',
          filterComponent: textFilter,
          disableSort: true,
        },
        {
          icon: <CalendarToday />,
          label: 'Start Date',
          dataKey: 'STARTDATE',
          filterComponent: dateFilter,
        },
        {
          icon: <CalendarToday />,
          label: 'End Date',
          dataKey: 'ENDDATE',
          filterComponent: dateFilter,
        },
      ]}
      buttons={[
        function cartButton(investigation: Investigation) {
          return !(
            selectedCards && selectedCards.includes(investigation.ID)
          ) ? (
            <Button
              id="add-to-cart-btn"
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineOutlined />}
              disableElevation
              onClick={() => addToCart([investigation.ID])}
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
                if (selectedCards && selectedCards.includes(investigation.ID))
                  removeFromCart([investigation.ID]);
              }}
            >
              Remove from cart
            </Button>
          );
        },
      ]}
      customFilters={[
        {
          label: 'Type ID',
          dataKey: 'TYPE_ID',
          filterItems: typeFilteredItems,
        },
        {
          label: 'Facility ID',
          dataKey: 'FACILITY_ID',
          filterItems: facilityFilteredItems,
        },
      ]}
    />
  );
};

const mapStateToProps = (state: StateType): InvestigationCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    query: state.dgcommon.query,
    sort: state.dgcommon.sort,
    filters: state.dgcommon.filters,
    filterData: state.dgcommon.filterData,
    cartItems: state.dgcommon.cartItems,
    view: state.dgcommon.query.view,
  };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): InvestigationCVDispatchProps => ({
  fetchData: (offsetParams: IndexRange) =>
    dispatch(fetchInvestigations({ offsetParams })),
  fetchCount: () => dispatch(fetchInvestigationCount()),

  addToCart: (entityIds: number[]) =>
    dispatch(addToCart('investigation', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('investigation', entityIds)),
  fetchTypeFilter: () => dispatch(fetchFilter('investigation', 'TYPE_ID')),
  fetchFacilityFilter: () =>
    dispatch(fetchFilter('investigation', 'FACILITY_ID')),

  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushResults: (results: number | null) => dispatch(pushPageResults(results)),
  clearData: () => dispatch(clearData()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InvestigationCardView);
