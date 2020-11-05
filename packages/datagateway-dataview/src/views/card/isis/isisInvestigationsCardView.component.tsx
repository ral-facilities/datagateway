import { Button } from '@material-ui/core';
import {
  AddCircleOutlineOutlined,
  RemoveCircleOutlineOutlined,
  Fingerprint,
  Public,
  Save,
  Assessment,
  CalendarToday,
} from '@material-ui/icons';
import {
  addToCart,
  clearData,
  DateColumnFilter,
  DateFilter,
  DownloadCartItem,
  Entity,
  fetchInvestigationDetails,
  fetchISISInvestigationCount,
  fetchISISInvestigations,
  Filter,
  FiltersType,
  formatBytes,
  Investigation,
  Order,
  pushPageFilter,
  pushPageNum,
  pushPageResults,
  pushPageSort,
  removeFromCart,
  SortType,
  tableLink,
  TextColumnFilter,
} from 'datagateway-common';
import {
  QueryParams,
  StateType,
  ViewsType,
} from 'datagateway-common/lib/state/app.types';
import React from 'react';
import { connect } from 'react-redux';
import { IndexRange } from 'react-virtualized';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import InvestigationDetailsPanel from '../../detailsPanels/isis/investigationDetailsPanel.component';
import CardView from '../cardView.component';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISInvestigationsCardViewProps {
  instrumentId: string;
  facilityCycleId: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISInvestigationsCVStateProps {
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  query: QueryParams;
  sort: SortType;
  cartItems: DownloadCartItem[];
  view: ViewsType;
  filters: FiltersType;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISInvestigationsCVDispatchProps {
  fetchData: (
    instrumentId: number,
    facilityCycleId: number,
    offsetParams: IndexRange
  ) => Promise<void>;
  fetchCount: (instrumentId: number, facilityCycleId: number) => Promise<void>;
  fetchDetails: (investigationId: number) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  clearData: () => Action;
  pushPage: (page: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  pushResults: (results: number) => Promise<void>;
  pushSort: (sort: string, order: Order | null) => Promise<void>;
}

type ISISInvestigationsCVCombinedProps = ISISInvestigationsCVDispatchProps &
  ISISInvestigationsCVStateProps &
  ISISInvestigationsCardViewProps;

const ISISInvestigationsCardView = (
  props: ISISInvestigationsCVCombinedProps
): React.ReactElement => {
  const {
    instrumentId,
    facilityCycleId,
    data,
    sort,
    totalDataCount,
    loading,
    query,
    cartItems,
    fetchData,
    fetchCount,
    fetchDetails,
    addToCart,
    removeFromCart,
    view,
    clearData,
    filters,
    pushFilters,
    pushPage,
    pushResults,
    pushSort,
  } = props;

  const [fetchedCount, setFetchedCount] = React.useState(false);
  const [investigationIds, setInvestigationIds] = React.useState<number[]>([]);

  const urlPrefix = `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation`;

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
    // Set the IDs of the investigation data.
    setInvestigationIds(data.map((investigation) => investigation.ID));

    if (!fetchedCount) {
      fetchCount(parseInt(instrumentId), parseInt(facilityCycleId));
      setFetchedCount(true);
    }
  }, [
    instrumentId,
    facilityCycleId,
    data,
    clearData,
    fetchedCount,
    fetchCount,
    setFetchedCount,
  ]);

  return (
    <CardView
      data={data}
      totalDataCount={totalDataCount}
      loading={loading}
      sort={sort}
      filters={filters}
      query={query}
      onPageChange={pushPage}
      onResultsChange={pushResults}
      onSort={pushSort}
      onFilter={pushFilters}
      clearData={clearData}
      loadData={(params) =>
        fetchData(parseInt(instrumentId), parseInt(facilityCycleId), params)
      }
      loadCount={() =>
        fetchCount(parseInt(instrumentId), parseInt(facilityCycleId))
      }
      title={{
        label: 'Title',
        dataKey: 'TITLE',
        content: (investigation: Investigation) =>
          tableLink(
            `${urlPrefix}/${investigation.ID}/dataset`,
            investigation.TITLE,
            view
          ),
        filterComponent: textFilter,
      }}
      description={{
        label: 'Description',
        dataKey: 'SUMMARY',
        filterComponent: textFilter,
      }}
      information={[
        {
          icon: <Fingerprint />,
          label: 'Visit ID',
          dataKey: 'VISIT_ID',
          filterComponent: textFilter,
        },
        {
          icon: <Fingerprint />,
          label: 'RB Number',
          dataKey: 'NAME',
          filterComponent: textFilter,
        },
        {
          icon: <Public />,
          label: 'DOI',
          dataKey: 'STUDYINVESTIGATION[0].STUDY.PID',
          filterComponent: textFilter,
        },
        {
          icon: <Save />,
          label: 'Size',
          dataKey: 'SIZE',
          content: (investigation: Investigation) =>
            formatBytes(investigation.SIZE),
          disableSort: true,
        },
        {
          icon: <Assessment />,
          label: 'Instrument',
          dataKey: 'INVESTIGATIONINSTRUMENT[0].INSTRUMENT.FULLNAME',
          filterComponent: textFilter,
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
      moreInformation={(investigation: Investigation) => (
        <InvestigationDetailsPanel
          rowData={investigation}
          fetchDetails={fetchDetails}
        />
      )}
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
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): ISISInvestigationsCVDispatchProps => ({
  fetchData: (
    instrumentId: number,
    facilityCycleId: number,
    offsetParams: IndexRange
  ) =>
    dispatch(
      fetchISISInvestigations({
        instrumentId,
        facilityCycleId,
        offsetParams,
        optionalParams: { getSize: true },
      })
    ),
  fetchCount: (instrumentId: number, facilityCycleId: number) =>
    dispatch(fetchISISInvestigationCount(instrumentId, facilityCycleId)),
  fetchDetails: (investigationId: number) =>
    dispatch(fetchInvestigationDetails(investigationId)),
  addToCart: (entityIds: number[]) =>
    dispatch(addToCart('investigation', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('investigation', entityIds)),
  clearData: () => dispatch(clearData()),

  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushResults: (results: number | null) => dispatch(pushPageResults(results)),
});

const mapStateToProps = (state: StateType): ISISInvestigationsCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    query: state.dgcommon.query,
    sort: state.dgcommon.sort,
    cartItems: state.dgcommon.cartItems,
    view: state.dgcommon.query.view,
    filters: state.dgcommon.filters,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISInvestigationsCardView);
