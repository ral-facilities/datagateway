import {
  addToCart,
  DateColumnFilter,
  DateFilter,
  DownloadCartItem,
  Entity,
  fetchAllIds,
  fetchAllISISInvestigationIds,
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
  pushPageSort,
  removeFromCart,
  SortType,
  Table,
  tableLink,
  TextColumnFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import InvestigationDetailsPanel from '../../detailsPanels/isis/investigationDetailsPanel.component';

import TitleIcon from '@material-ui/icons/Title';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import PublicIcon from '@material-ui/icons/Public';
import SaveIcon from '@material-ui/icons/Save';
import AssessmentIcon from '@material-ui/icons/Assessment';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';

interface ISISInvestigationsTableProps {
  instrumentId: string;
  instrumentChildId: string;
  studyHierarchy: boolean;
}

interface ISISInvestigationsTableStoreProps {
  sort: SortType;
  filters: FiltersType;
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  error: string | null;
  cartItems: DownloadCartItem[];
  allIds: number[];
  selectAllSetting: boolean;
}

interface ISISInvestigationsTableDispatchProps {
  pushSort: (sort: string, order: Order | null) => Promise<void>;

  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
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
  fetchFacilityCycleAllIds: () => Promise<void>;
  fetchStudyAllIds: () => Promise<void>;
}

type ISISInvestigationsTableCombinedProps = ISISInvestigationsTableProps &
  ISISInvestigationsTableStoreProps &
  ISISInvestigationsTableDispatchProps;

const ISISInvestigationsTable = (
  props: ISISInvestigationsTableCombinedProps
): React.ReactElement => {
  const {
    data,
    totalDataCount,
    fetchFacilityCycleData,
    fetchFacilityCycleCount,
    fetchStudyData,
    fetchStudyCount,
    sort,
    pushSort,
    filters,
    pushFilters,
    instrumentId,
    instrumentChildId,
    loading,
    cartItems,
    addToCart,
    removeFromCart,
    allIds,
    selectAllSetting,
    fetchFacilityCycleAllIds,
    fetchStudyAllIds,
    studyHierarchy,
  } = props;

  const [t] = useTranslation();

  const selectedRows = React.useMemo(
    () =>
      cartItems
        .filter(
          (cartItem) =>
            cartItem.entityType === 'investigation' &&
            allIds.includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, allIds]
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

  const fetchCount = studyHierarchy ? fetchStudyCount : fetchFacilityCycleCount;
  const fetchData = studyHierarchy ? fetchStudyData : fetchFacilityCycleData;
  const fetchAllIds = studyHierarchy
    ? fetchStudyAllIds
    : fetchFacilityCycleAllIds;

  React.useEffect(() => {
    fetchCount(parseInt(instrumentId), parseInt(instrumentChildId));
    fetchAllIds();
  }, [fetchCount, fetchAllIds, instrumentId, instrumentChildId, filters]);

  React.useEffect(() => {
    fetchData(parseInt(instrumentId), parseInt(instrumentChildId), {
      startIndex: 0,
      stopIndex: 49,
    });
  }, [fetchData, instrumentId, instrumentChildId, sort, filters]);

  const pathRoot = studyHierarchy ? 'browseStudyHierarchy' : 'browse';
  const instrumentChild = studyHierarchy ? 'study' : 'facilityCycle';
  const urlPrefix = `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${instrumentChildId}/investigation`;

  return (
    <Table
      loading={loading}
      data={data}
      loadMoreRows={(params) =>
        fetchData(parseInt(instrumentId), parseInt(instrumentChildId), params)
      }
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={pushSort}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      disableSelectAll={!selectAllSetting}
      detailsPanel={({ rowData, detailsPanelResize }) => {
        return (
          <InvestigationDetailsPanel
            rowData={rowData}
            detailsPanelResize={detailsPanelResize}
            fetchDetails={props.fetchDetails}
          />
        );
      }}
      columns={[
        {
          icon: <TitleIcon />,
          label: t('investigations.title'),
          dataKey: 'title',
          cellContentRenderer: (props: TableCellProps) => {
            const investigationData = props.rowData as Investigation;
            return tableLink(
              `${urlPrefix}/${investigationData.id}/dataset`,
              investigationData.title
            );
          },
          filterComponent: textFilter,
        },
        {
          icon: <FingerprintIcon />,
          label: t('investigations.visitId'),
          dataKey: 'visitId',
          cellContentRenderer: (props: TableCellProps) => {
            const investigationData = props.rowData as Investigation;
            return tableLink(
              `${urlPrefix}/${investigationData.id}/dataset`,
              investigationData.visitId
            );
          },
          filterComponent: textFilter,
        },
        {
          icon: <FingerprintIcon />,
          label: t('investigations.name'),
          dataKey: 'name',
          cellContentRenderer: (props: TableCellProps) => {
            const investigationData = props.rowData as Investigation;
            return tableLink(
              `${urlPrefix}/${investigationData.id}/dataset`,
              investigationData.name
            );
          },
          filterComponent: textFilter,
        },
        {
          icon: <PublicIcon />,
          label: t('investigations.doi'),
          dataKey: 'studyInvestigations.study.PID',
          cellContentRenderer: (props: TableCellProps) => {
            const investigationData = props.rowData as Investigation;
            if (
              investigationData.studyInvestigations &&
              investigationData.studyInvestigations[0].study
            ) {
              return tableLink(
                `${urlPrefix}/${investigationData.id}/dataset`,
                investigationData.studyInvestigations[0].study.PID
              );
            } else {
              return '';
            }
          },
          filterComponent: textFilter,
        },
        {
          icon: <SaveIcon />,
          label: t('investigations.size'),
          dataKey: 'size',
          cellContentRenderer: (props) => {
            return formatBytes(props.cellData);
          },
          disableSort: true,
        },
        {
          icon: <AssessmentIcon />,
          label: t('investigations.instrument'),
          dataKey: 'investigationInstruments.instrument.fullName',
          cellContentRenderer: (props: TableCellProps) => {
            const investigationData = props.rowData as Investigation;
            if (
              investigationData.investigationInstruments &&
              investigationData.investigationInstruments[0].instrument
            ) {
              return investigationData.investigationInstruments[0].instrument
                .fullName;
            } else {
              return '';
            }
          },
          filterComponent: textFilter,
        },
        {
          icon: <CalendarTodayIcon />,
          label: t('investigations.start_date'),
          dataKey: 'startDate',
          filterComponent: dateFilter,
          disableHeaderWrap: true,
        },
        {
          icon: <CalendarTodayIcon />,

          label: t('investigations.end_date'),
          dataKey: 'endDate',
          filterComponent: dateFilter,
          disableHeaderWrap: true,
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>,
  ownProps: ISISInvestigationsTableProps
): ISISInvestigationsTableDispatchProps => ({
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),

  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
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
  fetchFacilityCycleAllIds: () =>
    dispatch(
      fetchAllISISInvestigationIds(
        parseInt(ownProps.instrumentId),
        parseInt(ownProps.instrumentChildId)
      )
    ),
  fetchStudyAllIds: () =>
    dispatch(
      fetchAllIds('investigation', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'investigationInstruments.instrument.id': {
              eq: ownProps.instrumentId,
            },
          }),
        },
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'studyInvestigations.study.id': { eq: ownProps.instrumentChildId },
          }),
        },
      ])
    ),
});

const mapStateToProps = (
  state: StateType
): ISISInvestigationsTableStoreProps => {
  return {
    sort: state.dgcommon.query.sort,
    filters: state.dgcommon.query.filters,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    error: state.dgcommon.error,
    cartItems: state.dgcommon.cartItems,
    allIds: state.dgcommon.allIds,
    selectAllSetting: state.dgdataview.selectAllSetting,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISInvestigationsTable);
