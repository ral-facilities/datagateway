import {
  DateColumnFilter,
  DateFilter,
  Entity,
  fetchInvestigationCount,
  fetchInvestigationDetails,
  fetchInvestigations,
  fetchInvestigationSize,
  Filter,
  FiltersType,
  Investigation,
  Order,
  pushPageFilter,
  pushPageSort,
  readSciGatewayToken,
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
import VisitDetailsPanel from '../../detailsPanels/dls/visitDetailsPanel.component';

import TitleIcon from '@material-ui/icons/Title';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import ConfirmationNumberIcon from '@material-ui/icons/ConfirmationNumber';
import AssessmentIcon from '@material-ui/icons/Assessment';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';

interface DLSMyDataTableStoreProps {
  sort: SortType;
  filters: FiltersType;
  view: ViewsType;
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  error: string | null;
  selectAllSetting: boolean;
}

interface DLSMyDataTableDispatchProps {
  pushSort: (sort: string, order: Order | null) => Promise<void>;

  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  fetchData: (username: string, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (username: string) => Promise<void>;

  fetchDetails: (investigationId: number) => Promise<void>;
  fetchSize: (investigationId: number) => Promise<void>;
}

type DLSMyDataTableCombinedProps = DLSMyDataTableStoreProps &
  DLSMyDataTableDispatchProps;

const DLSMyDataTable = (
  props: DLSMyDataTableCombinedProps
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
    selectAllSetting,
  } = props;

  const [t] = useTranslation();
  const username = readSciGatewayToken().username || '';

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
    // Sort and filter by STARTDATE upon load.
    pushSort('STARTDATE', 'desc');
    pushFilters('STARTDATE', {
      endDate: `${new Date(Date.now()).toISOString().split('T')[0]}`,
    });
  }, [pushSort, pushFilters]);

  React.useEffect(() => {
    fetchCount(username);
  }, [fetchCount, filters, username]);

  React.useEffect(() => {
    fetchData(username, { startIndex: 0, stopIndex: 49 });
  }, [fetchData, sort, filters, username]);

  return (
    <Table
      loading={loading}
      data={data}
      loadMoreRows={(params) => fetchData(username, params)}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={pushSort}
      disableSelectAll={!selectAllSetting}
      detailsPanel={({ rowData, detailsPanelResize }) => {
        return (
          <VisitDetailsPanel
            rowData={rowData}
            detailsPanelResize={detailsPanelResize}
            fetchDetails={props.fetchDetails}
            fetchSize={props.fetchSize}
          />
        );
      }}
      columns={[
        {
          icon: <TitleIcon />,
          label: t('investigations.title'),
          dataKey: 'TITLE',
          cellContentRenderer: (cellProps: TableCellProps) => {
            const investigationData = cellProps.rowData as Investigation;
            return tableLink(
              `/browse/proposal/${investigationData.NAME}/investigation/${investigationData.ID}/dataset`,
              investigationData.TITLE,
              view
            );
          },
          filterComponent: textFilter,
        },
        {
          icon: <FingerprintIcon />,
          label: t('investigations.visit_id'),
          dataKey: 'VISIT_ID',
          cellContentRenderer: (cellProps: TableCellProps) => {
            const investigationData = cellProps.rowData as Investigation;
            return tableLink(
              `/browse/proposal/${investigationData.NAME}/investigation/${investigationData.ID}/dataset`,
              investigationData.VISIT_ID,
              view
            );
          },
          filterComponent: textFilter,
        },
        {
          icon: <ConfirmationNumberIcon />,
          label: t('investigations.dataset_count'),
          dataKey: 'DATASET_COUNT',
          disableSort: true,
        },
        {
          icon: <AssessmentIcon />,
          label: t('investigations.instrument'),
          dataKey: 'INVESTIGATIONINSTRUMENT.INSTRUMENT.NAME',
          cellContentRenderer: (cellProps: TableCellProps) => {
            const investigationData = cellProps.rowData as Investigation;
            if (
              investigationData.INVESTIGATIONINSTRUMENT &&
              investigationData.INVESTIGATIONINSTRUMENT[0].INSTRUMENT
            ) {
              return investigationData.INVESTIGATIONINSTRUMENT[0].INSTRUMENT
                .NAME;
            } else {
              return '';
            }
          },
          filterComponent: textFilter,
        },
        {
          icon: <CalendarTodayIcon />,
          label: t('investigations.start_date'),
          dataKey: 'STARTDATE',
          filterComponent: dateFilter,
          disableHeaderWrap: true,
        },
        {
          icon: <CalendarTodayIcon />,

          label: t('investigations.end_date'),
          dataKey: 'ENDDATE',
          filterComponent: dateFilter,
          disableHeaderWrap: true,
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): DLSMyDataTableDispatchProps => ({
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
              'INVESTIGATIONUSER.USER.NAME': { eq: username },
            }),
          },
          {
            filterType: 'include',
            filterValue: JSON.stringify([
              {
                INVESTIGATIONINSTRUMENT: 'INSTRUMENT',
              },
              { INVESTIGATIONUSER: 'USER_' },
            ]),
          },
        ],
        getDatasetCount: true,
      })
    ),
  fetchCount: (username: string) =>
    dispatch(
      fetchInvestigationCount([
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'INVESTIGATIONUSER.USER.NAME': { eq: username },
          }),
        },
        {
          filterType: 'include',
          filterValue: JSON.stringify({ INVESTIGATIONUSER: 'USER_' }),
        },
      ])
    ),

  fetchDetails: (investigationId: number) =>
    dispatch(fetchInvestigationDetails(investigationId)),
  fetchSize: (investigationId: number) =>
    dispatch(fetchInvestigationSize(investigationId)),
});

const mapStateToProps = (state: StateType): DLSMyDataTableStoreProps => {
  return {
    sort: state.dgcommon.query.sort,
    filters: state.dgcommon.query.filters,
    view: state.dgcommon.query.view,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    error: state.dgcommon.error,
    selectAllSetting: state.dgdataview.selectAllSetting,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DLSMyDataTable);
