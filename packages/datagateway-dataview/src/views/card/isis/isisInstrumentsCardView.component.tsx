import { Link } from '@material-ui/core';
import { Title, Link as LinkIcon } from '@material-ui/icons';
import { RouterLocation } from 'connected-react-router';
import {
  CardView,
  Entity,
  fetchInstrumentCount,
  fetchInstrumentDetails,
  fetchInstruments,
  Filter,
  Instrument,
  pushPageFilter,
  pushPageNum,
  pushPageSort,
  pushPageResults,
  pushQuery,
  readURLQuery,
  tableLink,
  TextColumnFilter,
  TextFilter,
  Order,
  QueryParams,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { IndexRange } from 'react-virtualized';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import InstrumentDetailsPanel from '../../detailsPanels/isis/instrumentDetailsPanel.component';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISStudiesCVProps {
  studyHierarchy: boolean;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISInstrumentsCVDispatchProps {
  fetchData: (offsetParams: IndexRange) => Promise<void>;
  fetchCount: () => Promise<void>;
  fetchDetails: (instrumentId: number) => Promise<void>;
  pushPage: (page: number) => Promise<void>;
  pushResults: (page: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  pushSort: (sort: string, order: Order | null) => Promise<void>;
  pushQuery: (query: QueryParams) => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISInstrumentsCVStateProps {
  data: Entity[];
  totalDataCount: number;
  loadedData: boolean;
  loadedCount: boolean;
  location: RouterLocation<unknown>;
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
    location,
    loadedData,
    loadedCount,
    fetchData,
    fetchCount,
    fetchDetails,
    pushFilters,
    pushPage,
    pushQuery,
    pushSort,
    pushResults,
    studyHierarchy,
  } = props;

  const [t] = useTranslation();

  const { page, results } = React.useMemo(() => readURLQuery(location), [
    location,
  ]);
  const query = React.useMemo(() => readURLQuery(location), [location]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filters = React.useMemo(() => readURLQuery(location).filters, [
    location.query.filters,
  ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sort = React.useMemo(() => readURLQuery(location).sort, [
    location.query.sort,
  ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const view = React.useMemo(() => readURLQuery(location).view, [
    location.query.view,
  ]);

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      value={filters[dataKey] as TextFilter}
      onChange={(value: { value?: string | number; type: string } | null) =>
        pushFilters(dataKey, value ? value : null)
      }
    />
  );

  const pathRoot = studyHierarchy ? 'browseStudyHierarchy' : 'browse';
  const instrumentChild = studyHierarchy ? 'study' : 'facilityCycle';

  return (
    <CardView
      data={data}
      totalDataCount={totalDataCount}
      loadData={fetchData}
      loadCount={fetchCount}
      query={query}
      onPageChange={pushPage}
      onFilter={pushFilters}
      pushQuery={pushQuery}
      onSort={pushSort}
      onResultsChange={pushResults}
      loadedData={loadedData}
      loadedCount={loadedCount}
      filters={filters}
      sort={sort}
      page={page}
      results={results}
      title={{
        label: t('instruments.name'),
        dataKey: 'fullName',
        content: (instrument: Instrument) =>
          tableLink(
            `/${pathRoot}/instrument/${instrument.id}/${instrumentChild}`,
            instrument.fullName || instrument.name,
            view
          ),
        filterComponent: textFilter,
      }}
      description={{
        label: t('instruments.description'),
        dataKey: 'description',
        filterComponent: textFilter,
      }}
      information={[
        {
          icon: <Title />,
          label: t('instruments.type'),
          dataKey: 'type',
          filterComponent: textFilter,
        },
        {
          icon: <LinkIcon />,
          label: t('instruments.url'),
          dataKey: 'url',
          // eslint-disable-next-line react/display-name
          content: (instrument: Instrument) => (
            <Link href={instrument.url}>{instrument.url}</Link>
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
    location: state.router.location,
    loadedData: state.dgcommon.loadedData,
    loadedCount: state.dgcommon.loadedCount,
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

  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushResults: (results: number | null) => dispatch(pushPageResults(results)),
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  pushQuery: (query: QueryParams) => dispatch(pushQuery(query)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISInstrumentsCardView);
