import {
  addToCart,
  DateColumnFilter,
  DateFilter,
  DownloadCartItem,
  Entity,
  fetchAllIds,
  fetchInvestigationCount,
  fetchInvestigationDetails,
  fetchInvestigations,
  Filter,
  FiltersType,
  formatBytes,
  Investigation,
  MicroFrontendId,
  NotificationType,
  Order,
  pushPageFilter,
  pushPageSort,
  readSciGatewayToken,
  removeFromCart,
  SortType,
  Table,
  tableLink,
  TextColumnFilter,
  ViewsType,
  TextFilter,
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

interface ISISMyDataTableStoreProps {
  sort: SortType;
  filters: FiltersType;
  view: ViewsType;
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  error: string | null;
  cartItems: DownloadCartItem[];
  allIds: number[];
  selectAllSetting: boolean;
}

interface ISISMyDataTableDispatchProps {
  pushSort: (sort: string, order: Order | null) => Promise<void>;

  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  fetchData: (username: string, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (username: string) => Promise<void>;

  fetchDetails: (investigationId: number) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchAllIds: (username: string) => Promise<void>;
}

type ISISMyDataTableCombinedProps = ISISMyDataTableStoreProps &
  ISISMyDataTableDispatchProps;

const ISISMyDataTable = (
  props: ISISMyDataTableCombinedProps
): React.ReactElement => {
  const {
    data,
    totalDataCount,
    fetchData,
    fetchCount,
    sort,
    pushSort,
    filters,
    pushFilters,
    view,
    loading,
    cartItems,
    addToCart,
    removeFromCart,
    allIds,
    fetchAllIds,
    selectAllSetting,
  } = props;

  const [t] = useTranslation();
  const username = readSciGatewayToken().username || '';

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

  // Broadcast a SciGateway notification for any warning encountered.
  const broadcastWarning = (message: string): void => {
    document.dispatchEvent(
      new CustomEvent(MicroFrontendId, {
        detail: {
          type: NotificationType,
          payload: {
            severity: 'warning',
            message,
          },
        },
      })
    );
  };

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

  React.useEffect(() => {
    if (localStorage.getItem('autoLogin') === 'true') {
      broadcastWarning(t('my_data_table.login_warning_msg'));
    }
  }, [t]);

  React.useEffect(() => {
    // Sort by startDate on load.
    pushSort('startDate', 'desc');
  }, [pushSort]);

  React.useEffect(() => {
    fetchCount(username);
    fetchAllIds(username);
  }, [fetchCount, fetchAllIds, username, filters]);

  React.useEffect(() => {
    fetchData(username, {
      startIndex: 0,
      stopIndex: 49,
    });
  }, [fetchData, username, sort, filters]);

  return (
    <Table
      loading={loading}
      data={data}
      loadMoreRows={(params) => fetchData(username, params)}
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
          cellContentRenderer: (cellProps: TableCellProps) => {
            const investigationData = cellProps.rowData as Investigation;
            if (
              investigationData.investigationInstruments &&
              investigationData.investigationInstruments[0].instrument &&
              investigationData.facility &&
              investigationData.facility.facilityCycles
            ) {
              const facilityCycle = investigationData.facility.facilityCycles.find(
                (facilitycycle) =>
                  facilitycycle.startDate &&
                  facilitycycle.endDate &&
                  investigationData.startDate &&
                  facilitycycle.startDate <= investigationData.startDate &&
                  facilitycycle.endDate >= investigationData.startDate
              );
              if (facilityCycle) {
                return tableLink(
                  `/browse/instrument/${investigationData.investigationInstruments[0].instrument.id}/facilityCycle/${facilityCycle.id}/investigation/${investigationData.id}/dataset`,
                  investigationData.title,
                  view
                );
              } else {
                return investigationData.title;
              }
            }
          },
          filterComponent: textFilter,
        },
        {
          icon: <PublicIcon />,
          label: t('investigations.doi'),
          dataKey: 'studyInvestigations.study.pid',
          cellContentRenderer: (cellProps: TableCellProps) => {
            const investigationData = cellProps.rowData as Investigation;
            if (
              investigationData.studyInvestigations &&
              investigationData.studyInvestigations[0].study
            ) {
              return investigationData.studyInvestigations[0].study.pid;
            } else {
              return '';
            }
          },
          filterComponent: textFilter,
        },
        {
          icon: <FingerprintIcon />,
          label: t('investigations.visitId'),
          dataKey: 'visitId',
          filterComponent: textFilter,
        },
        {
          icon: <TitleIcon />,
          label: t('investigations.name'),
          dataKey: 'name',
          cellContentRenderer: (cellProps: TableCellProps) => {
            const investigationData = cellProps.rowData as Investigation;
            if (
              investigationData.investigationInstruments &&
              investigationData.investigationInstruments[0].instrument &&
              investigationData.facility &&
              investigationData.facility.facilityCycles
            ) {
              const facilityCycle = investigationData.facility.facilityCycles.find(
                (facilitycycle) =>
                  facilitycycle.startDate &&
                  facilitycycle.endDate &&
                  investigationData.startDate &&
                  facilitycycle.startDate <= investigationData.startDate &&
                  facilitycycle.endDate >= investigationData.startDate
              );
              if (facilityCycle) {
                return tableLink(
                  `/browse/instrument/${investigationData.investigationInstruments[0].instrument.id}/facilityCycle/${facilityCycle.id}/investigation/${investigationData.id}/dataset`,
                  investigationData.name,
                  view
                );
              } else {
                return investigationData.name;
              }
            }
          },
          filterComponent: textFilter,
        },
        {
          icon: <AssessmentIcon />,
          label: t('investigations.instrument'),
          dataKey: 'investigationInstruments.instrument.fullName',
          cellContentRenderer: (cellProps: TableCellProps) => {
            const investigationData = cellProps.rowData as Investigation;
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
          icon: <SaveIcon />,
          label: t('investigations.size'),
          dataKey: 'size',
          cellContentRenderer: (cellProps) => {
            return formatBytes(cellProps.cellData);
          },
          disableSort: true,
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
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): ISISMyDataTableDispatchProps => ({
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  fetchData: (username: string, offsetParams: IndexRange) =>
    dispatch(
      fetchInvestigations({
        offsetParams,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              'investigationUsers.user.name': { eq: username },
            }),
          },
          {
            filterType: 'include',
            filterValue: JSON.stringify([
              {
                investigationInstruments: 'instrument',
              },
              { investigationUsers: 'user' },
              { studyInvestigations: 'study' },
              { facility: 'facilityCycles' },
            ]),
          },
        ],
        getSize: true,
      })
    ),
  fetchCount: (username: string) =>
    dispatch(
      fetchInvestigationCount([
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'investigationUsers.user.name': { eq: username },
          }),
        },
        {
          filterType: 'include',
          filterValue: JSON.stringify({ investigationUsers: 'user' }),
        },
      ])
    ),
  fetchDetails: (investigationId: number) =>
    dispatch(fetchInvestigationDetails(investigationId)),
  addToCart: (entityIds: number[]) =>
    dispatch(addToCart('investigation', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('investigation', entityIds)),
  fetchAllIds: (username: string) =>
    dispatch(
      fetchAllIds('investigation', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'investigationUsers.user.name': { eq: username },
          }),
        },
      ])
    ),
});

const mapStateToProps = (state: StateType): ISISMyDataTableStoreProps => {
  return {
    sort: state.dgcommon.query.sort,
    filters: state.dgcommon.query.filters,
    view: state.dgcommon.query.view,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    error: state.dgcommon.error,
    cartItems: state.dgcommon.cartItems,
    allIds: state.dgcommon.allIds,
    selectAllSetting: state.dgdataview.selectAllSetting,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ISISMyDataTable);
