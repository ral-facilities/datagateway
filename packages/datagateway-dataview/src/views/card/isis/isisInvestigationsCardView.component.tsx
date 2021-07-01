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
import { push } from 'connected-react-router';
import {
  addToCart,
  CardView,
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
  formatBytes,
  Investigation,
  pushPageFilter,
  pushPageNum,
  pushQuery,
  removeFromCart,
  tableLink,
  TextColumnFilter,
  TextFilter,
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
  query: QueryParams;
  cartItems: DownloadCartItem[];
  loadedData: boolean;
  loadedCount: boolean;
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
  pushPage: (page: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  pushQuery: (query: QueryParams) => Promise<void>;
  viewDatasets: (urlPrefix: string, view: ViewsType) => (id: number) => Action;
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
    totalDataCount,
    query,
    cartItems,
    loadedData,
    loadedCount,
    fetchFacilityCycleData,
    fetchStudyData,
    fetchFacilityCycleCount,
    fetchStudyCount,
    fetchDetails,
    addToCart,
    removeFromCart,
    pushFilters,
    pushPage,
    pushQuery,
    viewDatasets,
    studyHierarchy,
  } = props;

  const [t] = useTranslation();

  const filters = query.filters;
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
            data
              .map((investigation) => investigation.id)
              .includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, data]
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

  const loadCount = React.useCallback(
    () => fetchCount(parseInt(instrumentId), parseInt(instrumentChildId)),
    [fetchCount, instrumentId, instrumentChildId]
  );
  const loadData = React.useCallback(
    (params) =>
      fetchData(parseInt(instrumentId), parseInt(instrumentChildId), params),
    [fetchData, instrumentId, instrumentChildId]
  );

  return (
    <CardView
      data={data}
      totalDataCount={totalDataCount}
      query={query}
      onPageChange={pushPage}
      onFilter={pushFilters}
      pushQuery={pushQuery}
      loadedData={loadedData}
      loadedCount={loadedCount}
      loadData={loadData}
      loadCount={loadCount}
      title={{
        label: t('investigations.title'),
        dataKey: 'title',
        content: (investigation: Investigation) =>
          tableLink(
            `${urlPrefix}/${investigation.id}`,
            investigation.title,
            query.view
          ),
        filterComponent: textFilter,
      }}
      description={{
        label: t('investigations.details.summary'),
        dataKey: 'summary',
        filterComponent: textFilter,
      }}
      information={[
        {
          icon: <Fingerprint />,
          label: t('investigations.visit_id'),
          dataKey: 'visitId',
          filterComponent: textFilter,
        },
        {
          icon: <Fingerprint />,
          label: t('investigations.name'),
          dataKey: 'name',
          filterComponent: textFilter,
        },
        {
          icon: <Public />,
          label: t('investigations.doi'),
          dataKey: 'studyInvestigations[0].study.pid',
          filterComponent: textFilter,
        },
        {
          icon: <Save />,
          label: t('investigations.details.size'),
          dataKey: 'size',
          content: (investigation: Investigation) =>
            formatBytes(investigation.size),
          disableSort: true,
        },
        {
          icon: <Assessment />,
          label: t('investigations.instrument'),
          dataKey: 'investigationInstruments[0].instrument.fullName',
          filterComponent: textFilter,
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
      moreInformation={(investigation: Investigation) => (
        <InvestigationDetailsPanel
          rowData={investigation}
          fetchDetails={fetchDetails}
          viewDatasets={viewDatasets(urlPrefix, query.view)}
        />
      )}
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
              'investigationInstruments.instrument.id': { eq: instrumentId },
            }),
          },
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              'studyInvestigations.study.id': { eq: studyId },
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
            'investigationInstruments.instrument.id': { eq: instrumentId },
          }),
        },
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'studyInvestigations.study.id': { eq: studyId },
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

  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushQuery: (query: QueryParams) => dispatch(pushQuery(query)),
  viewDatasets: (urlPrefix: string, view: ViewsType) => {
    return (id: number) => {
      const url = view
        ? `${urlPrefix}/${id}/dataset?view=${view}`
        : `${urlPrefix}/${id}/dataset`;
      return dispatch(push(url));
    };
  },
});

const mapStateToProps = (state: StateType): ISISInvestigationsCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    query: state.dgcommon.query,
    cartItems: state.dgcommon.cartItems,
    loadedData: state.dgcommon.loadedData,
    loadedCount: state.dgcommon.loadedCount,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISInvestigationsCardView);
