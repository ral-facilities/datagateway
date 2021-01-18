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
  DateColumnFilter,
  DateFilter,
  DownloadCartItem,
  Entity,
  fetchFilter,
  fetchInvestigationCount,
  fetchInvestigations,
  Filter,
  Investigation,
  investigationLink,
  pushPageFilter,
  pushPageNum,
  pushQuery,
  removeFromCart,
  TextColumnFilter,
} from 'datagateway-common';
import {
  FilterDataType,
  QueryParams,
  StateType,
} from 'datagateway-common/lib/state/app.types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { IndexRange } from 'react-virtualized';
import { AnyAction } from 'redux';
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
  pushQuery: (query: QueryParams) => Promise<void>;
}

interface InvestigationCVStateProps {
  data: Entity[];
  totalDataCount: number;
  query: QueryParams;
  filterData: FilterDataType;
  cartItems: DownloadCartItem[];
}

type InvestigationCVCombinedProps = InvestigationCVDispatchProps &
  InvestigationCVStateProps;

const InvestigationCardView = (
  props: InvestigationCVCombinedProps
): React.ReactElement => {
  const {
    data,
    totalDataCount,
    query,
    filterData,
    cartItems,
    pushPage,
    pushFilters,
    pushQuery,
    fetchData,
    fetchCount,
    fetchTypeFilter,
    fetchFacilityFilter,
    addToCart,
    removeFromCart,
  } = props;

  const filters = query.filters;
  const [t] = useTranslation();

  React.useEffect(() => {
    fetchTypeFilter();
    fetchFacilityFilter();
  }, [fetchTypeFilter, fetchFacilityFilter]);

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
            data
              .map((investigation) => investigation.ID)
              .includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, data]
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

  return (
    <CardView
      data={data}
      totalDataCount={totalDataCount}
      query={query}
      loadData={fetchData}
      loadCount={fetchCount}
      onPageChange={pushPage}
      onFilter={pushFilters}
      pushQuery={pushQuery}
      title={{
        // Provide label for filter component.
        label: t('investigations.title'),
        // Provide both the dataKey (for tooltip) and content to render.
        dataKey: 'TITLE',
        content: (investigation: Investigation) => {
          return investigationLink(
            investigation.ID,
            investigation.TITLE,
            query.view
          );
        },
        filterComponent: textFilter,
      }}
      description={{
        label: t('investigations.details.summary'),
        dataKey: 'SUMMARY',
        filterComponent: textFilter,
      }}
      information={[
        {
          icon: <Public />,
          label: t('investigations.doi'),
          dataKey: 'DOI',
          filterComponent: textFilter,
        },
        {
          icon: <Fingerprint />,
          label: t('investigations.visit_id'),
          dataKey: 'VISIT_ID',
          filterComponent: textFilter,
        },
        {
          icon: <Fingerprint />,
          label: t('investigations.details.rb_number'),
          dataKey: 'RB_NUMBER',
          filterComponent: textFilter,
          disableSort: true,
        },
        {
          icon: <ConfirmationNumber />,
          label: t('investigations.dataset_count'),
          dataKey: 'DATASET_COUNT',
          filterComponent: textFilter,
          disableSort: true,
        },
        {
          icon: <CalendarToday />,
          label: t('investigations.details.start_date'),
          dataKey: 'STARTDATE',
          filterComponent: dateFilter,
        },
        {
          icon: <CalendarToday />,
          label: t('investigations.details.end_date'),
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
      // If was a specific dataKey on the custom filter request,
      // use that over the filterKey here.
      customFilters={[
        {
          label: t('investigations.type_id'),
          dataKey: 'TYPE_ID',
          filterItems: typeFilteredItems,
        },
        {
          label: t('investigations.facility_id'),
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
    query: state.dgcommon.query,
    filterData: state.dgcommon.filterData,
    cartItems: state.dgcommon.cartItems,
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
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushQuery: (query: QueryParams) => dispatch(pushQuery(query)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InvestigationCardView);
