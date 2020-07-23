import { Button } from '@material-ui/core';
import {
  AddCircleOutlineOutlined,
  RemoveCircleOutlineOutlined,
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
} from 'datagateway-common';
import {
  FilterDataType,
  StateType,
  ViewsType,
} from 'datagateway-common/lib/state/app.types';
import React from 'react';
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
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
}

interface InvestigationCVStateProps {
  data: Entity[];
  totalDataCount: number;
  filterData: FilterDataType;
  cartItems: DownloadCartItem[];
  filters: FiltersType;
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
    filterData,
    filters,
    cartItems,
    fetchData,
    fetchCount,
    fetchTypeFilter,
    fetchFacilityFilter,
    addToCart,
    removeFromCart,
    pushFilters,
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
      // onChange={(value: string) => filterTable(dataKey, value ? value : null)}
      onChange={(value: string) => pushFilters(dataKey, value ? value : null)}
    />
  );

  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <DateColumnFilter
      label={label}
      value={filters[dataKey] as DateFilter}
      onChange={(value: { startDate?: string; endDate?: string } | null) =>
        // filterTable(dataKey, value)
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
      loadData={fetchData}
      loadCount={fetchCount}
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
          label: 'DOI',
          dataKey: 'DOI',
          filterComponent: textFilter,
        },
        {
          label: 'Visit ID',
          dataKey: 'VISIT_ID',
          filterComponent: textFilter,
        },
        {
          label: 'RB Number',
          dataKey: 'RB_NUMBER',
          filterComponent: textFilter,
        },
        {
          label: 'Dataset Count',
          dataKey: 'DATASET_COUNT',
          filterComponent: textFilter,
          disableSort: true,
        },
        {
          label: 'Start Date',
          dataKey: 'STARTDATE',
          filterComponent: dateFilter,
        },
        {
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
      // TODO: Add image into card views when image is supported by API.
      // image={{
      //   url: '[IMAGE URL]',
      //   title: 'Investigation Image',
      // }}
      cardFilters={[
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
    filterData: state.dgcommon.filterData,
    cartItems: state.dgcommon.cartItems,
    filters: state.dgcommon.filters,
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
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InvestigationCardView);
