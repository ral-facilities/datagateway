import { Link } from '@material-ui/core';
import { Title, Link as LinkIcon } from '@material-ui/icons';
import {
  clearData,
  Entity,
  fetchInstrumentCount,
  fetchInstrumentDetails,
  fetchInstruments,
  Filter,
  FiltersType,
  Instrument,
  Order,
  pushPageFilter,
  pushPageNum,
  pushPageResults,
  pushPageSort,
  SortType,
  tableLink,
  TextColumnFilter,
  TextFilter,
} from 'datagateway-common';
import { QueryParams, ViewsType } from 'datagateway-common/lib/state/app.types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { IndexRange } from 'react-virtualized';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import InstrumentDetailsPanel from '../../detailsPanels/isis/instrumentDetailsPanel.component';
import CardView from '../cardView.component';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISStudiesCVProps {
  studyHierarchy: boolean;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISInstrumentsCVDispatchProps {
  fetchData: (offsetParams: IndexRange) => Promise<void>;
  fetchCount: () => Promise<void>;
  fetchDetails: (instrumentId: number) => Promise<void>;
  clearData: () => Action;
  pushPage: (page: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  pushResults: (results: number) => Promise<void>;
  pushSort: (sort: string, order: Order | null) => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISInstrumentsCVStateProps {
  data: Entity[];
  totalDataCount: number;
  view: ViewsType;
  filters: FiltersType;
  loading: boolean;
  query: QueryParams;
  sort: SortType;
}

type ISISInstrumentsCVCombinedProps = ISISInstrumentsCVDispatchProps &
  ISISInstrumentsCVStateProps &
  ISISStudiesCVProps;

const ISISInstrumentsCardView = (
  props: ISISInstrumentsCVCombinedProps
): React.ReactElement => {
  const {
    data,
    totalDataCount,
    loading,
    query,
    sort,
    fetchData,
    fetchCount,
    fetchDetails,
    view,
    filters,
    pushFilters,
    pushPage,
    pushResults,
    pushSort,
    clearData,
    studyHierarchy,
  } = props;

  const [t] = useTranslation();

  const [fetchedCount, setFetchedCount] = React.useState(false);

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
    // Load count to trigger data to be fetched.
    if (!fetchedCount) {
      fetchCount();
      setFetchedCount(true);
    }
  }, [data, fetchedCount, fetchCount, setFetchedCount]);

  const pathRoot = studyHierarchy ? 'browseStudyHierarchy' : 'browse';
  const instrumentChild = studyHierarchy ? 'study' : 'facilityCycle';

  return (
    <CardView
      data={data}
      totalDataCount={totalDataCount}
      loadData={fetchData}
      loadCount={fetchCount}
      loading={loading}
      sort={sort}
      filters={filters}
      query={query}
      onPageChange={pushPage}
      onResultsChange={pushResults}
      onSort={pushSort}
      onFilter={pushFilters}
      clearData={clearData}
      title={{
        label: t('instruments.name'),
        dataKey: 'FULLNAME',
        content: (instrument: Instrument) =>
          tableLink(
            `/${pathRoot}/instrument/${instrument.ID}/${instrumentChild}`,
            instrument.FULLNAME || instrument.NAME,
            view
          ),
        filterComponent: textFilter,
      }}
      description={{
        label: t('instruments.description'),
        dataKey: 'DESCRIPTION',
        filterComponent: textFilter,
      }}
      information={[
        {
          icon: <Title />,
          label: t('instruments.type'),
          dataKey: 'TYPE',
          filterComponent: textFilter,
        },
        {
          icon: <LinkIcon />,
          label: t('instruments.url'),
          dataKey: 'URL',
          // eslint-disable-next-line react/display-name
          content: (instrument: Instrument) => (
            <Link href={instrument.URL}>{instrument.URL}</Link>
          ),
          filterComponent: textFilter,
        },
      ]}
      moreInformation={(instrument: Instrument) => (
        <InstrumentDetailsPanel
          rowData={instrument}
          fetchDetails={fetchDetails}
        />
      )}
    />
  );
};

const mapStateToProps = (state: StateType): ISISInstrumentsCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    view: state.dgcommon.query.view,
    filters: state.dgcommon.filters,
    loading: state.dgcommon.loading,
    query: state.dgcommon.query,
    sort: state.dgcommon.sort,
  };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): ISISInstrumentsCVDispatchProps => ({
  fetchData: (offsetParams: IndexRange) =>
    dispatch(fetchInstruments(offsetParams)),
  fetchCount: () => dispatch(fetchInstrumentCount()),
  fetchDetails: (instrumentId: number) =>
    dispatch(fetchInstrumentDetails(instrumentId)),
  clearData: () => dispatch(clearData()),

  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushResults: (results: number | null) => dispatch(pushPageResults(results)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISInstrumentsCardView);
