import {
  DateColumnFilter,
  DateFilter,
  Entity,
  fetchStudyCount,
  fetchStudies,
  Filter,
  Order,
  pushPageFilter,
  pushPageSort,
  Table,
  tableLink,
  TextColumnFilter,
  TextFilter,
  fetchAllIds,
  readURLQuery,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { RouterLocation } from 'connected-react-router';

import PublicIcon from '@material-ui/icons/Public';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import DescriptionIcon from '@material-ui/icons/Description';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';

interface ISISStudiesTableProps {
  instrumentId: string;
}

interface ISISStudiesTableStoreProps {
  location: RouterLocation<unknown>;
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
    pushSort,
    pushFilters,
    location,
    instrumentId,
    loading,
  } = props;

  const [t] = useTranslation();

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

  const [allIdsCleared, setAllIdsCleared] = React.useState(false);
  const { filters, view, sort } = React.useMemo(() => readURLQuery(location), [
    location,
  ]);

  React.useEffect(() => {
    if (allIds.length === 0) setAllIdsCleared(true);
  }, [setAllIdsCleared, allIds]);

  React.useEffect(() => {
    if (allIdsCleared) fetchIds(parseInt(instrumentId));
  }, [fetchIds, instrumentId, allIdsCleared]);

  React.useEffect(() => {
    if (allIdsCleared && allIds.length > 0) fetchCount(allIds);
  }, [fetchCount, location.query.filters, allIds, allIdsCleared]);

  React.useEffect(() => {
    if (allIdsCleared && allIds.length > 0)
      fetchData(allIds, { startIndex: 0, stopIndex: 49 });
  }, [
    fetchData,
    location.query.sort,
    location.query.filters,
    allIds,
    allIdsCleared,
  ]);

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
          dataKey: 'STUDY.NAME',
          cellContentRenderer: (cellProps: TableCellProps) =>
            tableLink(
              `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${cellProps.rowData.STUDY?.ID}`,
              cellProps.rowData.STUDY?.NAME,
              view
            ),
          filterComponent: textFilter,
        },
        {
          icon: <DescriptionIcon />,
          label: t('studies.description'),
          dataKey: 'STUDY.DESCRIPTION',
          filterComponent: textFilter,
        },
        {
          icon: <PublicIcon />,
          label: t('studies.pid'),
          dataKey: 'STUDY.PID',
          filterComponent: textFilter,
        },
        {
          icon: <CalendarTodayIcon />,
          label: t('studies.start_date'),
          dataKey: 'STUDY.STARTDATE',
          filterComponent: dateFilter,
        },
        {
          icon: <CalendarTodayIcon />,
          label: t('studies.end_date'),
          dataKey: 'STUDY.ENDDATE',
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
            'INVESTIGATIONINSTRUMENT.INSTRUMENT.ID': { eq: instrumentId },
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
            filterValue: JSON.stringify('STUDY'),
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
    location: state.router.location,
    allIds: state.dgcommon.allIds,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    error: state.dgcommon.error,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ISISStudiesTable);
