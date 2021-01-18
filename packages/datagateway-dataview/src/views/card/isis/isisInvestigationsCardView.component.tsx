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
} from 'datagateway-common';
import { QueryParams, StateType } from 'datagateway-common/lib/state/app.types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { IndexRange } from 'react-virtualized';
import { AnyAction } from 'redux';
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
  query: QueryParams;
  cartItems: DownloadCartItem[];
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
      loadData={loadData}
      loadCount={loadCount}
      title={{
        label: t('investigations.title'),
        dataKey: 'TITLE',
        content: (investigation: Investigation) =>
          tableLink(
            `${urlPrefix}/${investigation.ID}/dataset`,
            investigation.TITLE,
            query.view
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
          label: t('investigations.visit_id'),
          dataKey: 'VISIT_ID',
          filterComponent: textFilter,
        },
        {
          icon: <Fingerprint />,
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

  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushQuery: (query: QueryParams) => dispatch(pushQuery(query)),
});

const mapStateToProps = (state: StateType): ISISInvestigationsCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    query: state.dgcommon.query,
    cartItems: state.dgcommon.cartItems,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISInvestigationsCardView);
