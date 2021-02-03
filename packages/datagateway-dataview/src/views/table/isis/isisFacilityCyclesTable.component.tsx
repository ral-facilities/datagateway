import {
  DateColumnFilter,
  DateFilter,
  Entity,
  fetchFacilityCycleCount,
  fetchFacilityCycles,
  Filter,
  FiltersType,
  Order,
  pushPageFilter,
  pushPageSort,
  SortType,
  Table,
  tableLink,
  TextColumnFilter,
  ViewsType,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../../state/app.types';

import TitleIcon from '@material-ui/icons/Title';
import DescriptionIcon from '@material-ui/icons/Description';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';

interface ISISFacilityCyclesTableProps {
  instrumentId: string;
}

interface ISISFacilityCyclesTableStoreProps {
  sort: SortType;
  filters: FiltersType;
  view: ViewsType;
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  error: string | null;
  selectAllSetting: boolean;
}

interface ISISFacilityCyclesTableDispatchProps {
  pushSort: (sort: string, order: Order | null) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  fetchData: (instrumentId: number, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (instrumentId: number) => Promise<void>;
}

type ISISFacilityCyclesTableCombinedProps = ISISFacilityCyclesTableProps &
  ISISFacilityCyclesTableStoreProps &
  ISISFacilityCyclesTableDispatchProps;

const ISISFacilityCyclesTable = (
  props: ISISFacilityCyclesTableCombinedProps
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
    instrumentId,
    loading,
    selectAllSetting,
  } = props;

  const [t] = useTranslation();

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
    fetchCount(parseInt(instrumentId));
  }, [fetchCount, instrumentId, filters]);

  React.useEffect(() => {
    fetchData(parseInt(instrumentId), { startIndex: 0, stopIndex: 49 });
  }, [fetchData, instrumentId, sort, filters]);

  return (
    <Table
      loading={loading}
      data={data}
      loadMoreRows={(params) => fetchData(parseInt(instrumentId), params)}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={pushSort}
      disableSelectAll={!selectAllSetting}
      columns={[
        {
          icon: <TitleIcon />,
          label: t('facilitycycles.name'),
          dataKey: 'NAME',
          cellContentRenderer: (props: TableCellProps) =>
            tableLink(
              `/browse/instrument/${instrumentId}/facilityCycle/${props.rowData.ID}/investigation`,
              props.rowData.NAME,
              view
            ),
          filterComponent: textFilter,
        },
        {
          icon: <DescriptionIcon />,
          label: t('facilitycycles.description'),
          dataKey: 'DESCRIPTION',
          filterComponent: textFilter,
        },
        {
          icon: <CalendarTodayIcon />,
          label: t('facilitycycles.start_date'),
          dataKey: 'STARTDATE',
          filterComponent: dateFilter,
          disableHeaderWrap: true,
        },
        {
          icon: <CalendarTodayIcon />,
          label: t('facilitycycles.end_date'),
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
): ISISFacilityCyclesTableDispatchProps => ({
  fetchData: (instrumentId: number, offsetParams: IndexRange) =>
    dispatch(fetchFacilityCycles(instrumentId, offsetParams)),
  fetchCount: (instrumentId: number) =>
    dispatch(fetchFacilityCycleCount(instrumentId)),

  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
});

const mapStateToProps = (
  state: StateType
): ISISFacilityCyclesTableStoreProps => {
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISFacilityCyclesTable);
