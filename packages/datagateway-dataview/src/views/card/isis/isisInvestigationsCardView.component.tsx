import { Button } from '@material-ui/core';
import {
  AddCircleOutlineOutlined,
  RemoveCircleOutlineOutlined,
  Fingerprint,
  Public,
  Save,
  Assessment,
  CalendarToday,
  Title,
} from '@material-ui/icons';
import {
  addToCart,
  clearData,
  DateColumnFilter,
  DateFilter,
  DownloadCartItem,
  Entity,
  fetchInvestigationCount,
  fetchInvestigationDetails,
  fetchInvestigations,
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
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { IndexRange } from 'react-virtualized';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import InvestigationDetailsPanel from '../../detailsPanels/isis/investigationDetailsPanel.component';
import CardView from '../cardView.component';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISInvestigationsCardViewProps {
  instrumentId: string;
  instrumentChildId: string;
  studyHierarchy: boolean;
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
  fetchFacilityCycleData: (
    instrumentId: number,
    FacilityCycleId: number,
    offsetParams: IndexRange
  ) => Promise<void>;
  fetchStudyData: (
    instrumentId: number,
    StudyId: number,
    offsetParams: IndexRange
  ) => Promise<void>;
  fetchFacilityCycleCount: (
    instrumentId: number,
    facilityCycleId: number
  ) => Promise<void>;
  fetchStudyCount: (instrumentId: number, studyId: number) => Promise<void>;
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
    instrumentChildId,
    data,
    sort,
    totalDataCount,
    loading,
    query,
    cartItems,
    fetchFacilityCycleData,
    fetchStudyData,
    fetchFacilityCycleCount,
    fetchStudyCount,
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
    studyHierarchy,
  } = props;

  const [t] = useTranslation();

  const [fetchedCount, setFetchedCount] = React.useState(false);
  const [investigationIds, setInvestigationIds] = React.useState<number[]>([]);

  const pathRoot = studyHierarchy ? 'browseStudyHierarchy' : 'browse';
  const instrumentChild = studyHierarchy ? 'study' : 'facilityCycle';
  const urlPrefix = `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${instrumentChildId}/investigation`;
  const fetchData = studyHierarchy ? fetchStudyData : fetchFacilityCycleData;
  const fetchCount = studyHierarchy ? fetchStudyCount : fetchFacilityCycleCount;

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
      fetchCount(parseInt(instrumentId), parseInt(instrumentChildId));
      setFetchedCount(true);
    }
  }, [
    instrumentId,
    instrumentChildId,
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
        fetchData(parseInt(instrumentId), parseInt(instrumentChildId), params)
      }
      loadCount={() =>
        fetchCount(parseInt(instrumentId), parseInt(instrumentChildId))
      }
      title={{
        label: t('investigations.title'),
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
        label: t('investigations.details.summary'),
        dataKey: 'SUMMARY',
        filterComponent: textFilter,
      }}
      information={[
        {
          icon: <Fingerprint />,
          label: t('investigations.rb_number'),
          dataKey: 'VISIT_ID',
          filterComponent: textFilter,
        },
        {
          icon: <Title />,
          label: t('investigations.name'),
          dataKey: 'NAME',
          filterComponent: textFilter,
        },
        {
          icon: <Public />,
          label: t('investigations.doi'),
          dataKey: 'STUDYINVESTIGATION[0].STUDY.PID',
          filterComponent: textFilter,
        },
        {
          icon: <Save />,
          label: t('investigations.details.size'),
          dataKey: 'SIZE',
          content: (investigation: Investigation) =>
            formatBytes(investigation.SIZE),
          disableSort: true,
        },
        {
          icon: <Assessment />,
          label: t('investigations.instrument'),
          dataKey: 'INVESTIGATIONINSTRUMENT[0].INSTRUMENT.FULLNAME',
          filterComponent: textFilter,
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
  fetchFacilityCycleData: (
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
  fetchStudyData: (
    instrumentId: number,
    studyId: number,
    offsetParams: IndexRange
  ) =>
    dispatch(
      fetchInvestigations({
        offsetParams: offsetParams,
        getSize: true,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              'INVESTIGATIONINSTRUMENT.INSTRUMENT.ID': { eq: instrumentId },
              'INVESTIGATIONSTUDY.STUDY.ID': { eq: studyId },
            }),
          },
        ],
      })
    ),
  fetchFacilityCycleCount: (instrumentId: number, facilityCycleId: number) =>
    dispatch(fetchISISInvestigationCount(instrumentId, facilityCycleId)),
  fetchStudyCount: (instrumentId: number, studyId: number) =>
    dispatch(
      fetchInvestigationCount([
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'INVESTIGATIONINSTRUMENT.INSTRUMENT.ID': { eq: instrumentId },
            'INVESTIGATIONSTUDY.STUDY.ID': { eq: studyId },
          }),
        },
      ])
    ),
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
