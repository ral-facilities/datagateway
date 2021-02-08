import {
  Entity,
  fetchInstrumentCount,
  fetchInstrumentDetails,
  fetchInstruments,
  Filter,
  FiltersType,
  Instrument,
  Order,
  pushPageFilter,
  pushPageSort,
  SortType,
  Table,
  tableLink,
  TextColumnFilter,
  TextFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import InstrumentDetailsPanel from '../../detailsPanels/isis/instrumentDetailsPanel.component';

import TitleIcon from '@material-ui/icons/Title';

interface ISISInstrumentsTableProps {
  studyHierarchy: boolean;
}

interface ISISInstrumentsTableStoreProps {
  sort: SortType;
  filters: FiltersType;
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  error: string | null;
  selectAllSetting: boolean;
}

interface ISISInstrumentsTableDispatchProps {
  pushSort: (sort: string, order: Order | null) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  fetchData: (offsetParams: IndexRange) => Promise<void>;
  fetchCount: () => Promise<void>;
  fetchDetails: (instrumentId: number) => Promise<void>;
}

type ISISInstrumentsTableCombinedProps = ISISInstrumentsTableStoreProps &
  ISISInstrumentsTableDispatchProps &
  ISISInstrumentsTableProps;

const ISISInstrumentsTable = (
  props: ISISInstrumentsTableCombinedProps
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
    loading,
    selectAllSetting,
    studyHierarchy,
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

  React.useEffect(() => {
    fetchCount();
  }, [fetchCount, filters]);

  React.useEffect(() => {
    fetchData({ startIndex: 0, stopIndex: 49 });
  }, [fetchData, sort, filters]);

  const pathRoot = studyHierarchy ? 'browseStudyHierarchy' : 'browse';
  const instrumentChild = studyHierarchy ? 'study' : 'facilityCycle';

  return (
    <Table
      loading={loading}
      data={data}
      loadMoreRows={fetchData}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={pushSort}
      disableSelectAll={!selectAllSetting}
      detailsPanel={({ rowData, detailsPanelResize }) => {
        return (
          <InstrumentDetailsPanel
            rowData={rowData}
            detailsPanelResize={detailsPanelResize}
            fetchDetails={props.fetchDetails}
          />
        );
      }}
      columns={[
        {
          icon: <TitleIcon />,
          label: t('instruments.name'),
          dataKey: 'FULLNAME',
          cellContentRenderer: (props: TableCellProps) => {
            const instrumentData = props.rowData as Instrument;
            return tableLink(
              `/${pathRoot}/instrument/${instrumentData.ID}/${instrumentChild}`,
              instrumentData.FULLNAME || instrumentData.NAME
            );
          },
          filterComponent: textFilter,
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): ISISInstrumentsTableDispatchProps => ({
  fetchData: (offsetParams: IndexRange) =>
    dispatch(fetchInstruments(offsetParams)),
  fetchCount: () => dispatch(fetchInstrumentCount()),
  fetchDetails: (instrumentId: number) =>
    dispatch(fetchInstrumentDetails(instrumentId)),

  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
});

const mapStateToProps = (state: StateType): ISISInstrumentsTableStoreProps => {
  return {
    sort: state.dgcommon.query.sort,
    filters: state.dgcommon.query.filters,
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
)(ISISInstrumentsTable);
