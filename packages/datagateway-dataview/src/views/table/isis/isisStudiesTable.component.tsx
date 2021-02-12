import {
  DateColumnFilter,
  DateFilter,
  Entity,
  fetchStudyCount,
  fetchStudies,
  Filter,
  FiltersType,
  Order,
  pushPageFilter,
  pushPageSort,
  SortType,
  Table,
  tableLink,
  TextColumnFilter,
  fetchAllIds,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../../state/app.types';

import PublicIcon from '@material-ui/icons/Public';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import DescriptionIcon from '@material-ui/icons/Description';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';

interface ISISStudiesTableProps {
  instrumentId: string;
}

interface ISISStudiesTableStoreProps {
  sort: SortType;
  filters: FiltersType;
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  error: string | null;
  allIds: number[];
}

interface ISISStudiesTableDispatchProps {
  pushSort: (sort: string, order: Order | null) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  fetchData: (allIds: number[], offsetParams: IndexRange) => Promise<void>;
  fetchCount: (allIds: number[]) => Promise<void>;
  fetchIds: (instrumentId: number) => Promise<void>;
}

type ISISStudiesTableCombinedProps = ISISStudiesTableProps &
  ISISStudiesTableStoreProps &
  ISISStudiesTableDispatchProps;

const ISISStudiesTable = (
  props: ISISStudiesTableCombinedProps
): React.ReactElement => {
  const {
    allIds,
    data,
    totalDataCount,
    fetchIds,
    fetchData,
    fetchCount,
    sort,
    pushSort,
    filters,
    pushFilters,
    instrumentId,
    loading,
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

  const [allIdsCleared, setAllIdsCleared] = React.useState(false);

  React.useEffect(() => {
    if (allIds.length === 0) setAllIdsCleared(true);
  }, [setAllIdsCleared, allIds]);

  React.useEffect(() => {
    if (allIdsCleared) fetchIds(parseInt(instrumentId));
  }, [fetchIds, instrumentId, allIdsCleared]);

  React.useEffect(() => {
    if (allIdsCleared && allIds.length > 0) fetchCount(allIds);
  }, [fetchCount, filters, allIds, allIdsCleared]);

  React.useEffect(() => {
    if (allIdsCleared && allIds.length > 0)
      fetchData(allIds, { startIndex: 0, stopIndex: 49 });
  }, [fetchData, sort, filters, allIds, allIdsCleared]);

  const pathRoot = 'browseStudyHierarchy';
  const instrumentChild = 'study';

  return (
    <Table
      loading={loading}
      data={data}
      loadMoreRows={(params) => fetchData(allIds, params)}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={pushSort}
      columns={[
        {
          icon: <FingerprintIcon />,
          label: t('studies.name'),
          dataKey: 'study.name',
          cellContentRenderer: (props: TableCellProps) =>
            tableLink(
              `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${props.rowData.study?.id}/investigation`,
              props.rowData.study?.name
            ),
          filterComponent: textFilter,
        },
        {
          icon: <DescriptionIcon />,
          label: t('studies.description'),
          dataKey: 'study.description',
          filterComponent: textFilter,
        },
        {
          icon: <PublicIcon />,
          label: t('studies.pid'),
          dataKey: 'study.PID',
          filterComponent: textFilter,
        },
        {
          icon: <CalendarTodayIcon />,
          label: t('studies.start_date'),
          dataKey: 'study.startDate',
          filterComponent: dateFilter,
        },
        {
          icon: <CalendarTodayIcon />,
          label: t('studies.end_date'),
          dataKey: 'study.endDate',
          filterComponent: dateFilter,
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): ISISStudiesTableDispatchProps => ({
  fetchIds: (instrumentId: number) =>
    dispatch(
      fetchAllIds('investigation', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'investigationInstruments.instrument.id': { eq: instrumentId },
          }),
        },
      ])
    ),
  fetchData: (allIds: number[], offsetParams: IndexRange) =>
    dispatch(
      fetchStudies({
        offsetParams,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              INVESTIGATION_ID: { in: allIds },
            }),
          },
          {
            filterType: 'include',
            filterValue: JSON.stringify('study'),
          },
        ],
      })
    ),
  fetchCount: (allIds: number[]) =>
    dispatch(
      fetchStudyCount([
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            INVESTIGATION_ID: { in: allIds },
          }),
        },
      ])
    ),
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
});

const mapStateToProps = (state: StateType): ISISStudiesTableStoreProps => {
  return {
    sort: state.dgcommon.query.sort,
    filters: state.dgcommon.query.filters,
    allIds: state.dgcommon.allIds,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    error: state.dgcommon.error,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ISISStudiesTable);
