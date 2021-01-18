import { Link } from '@material-ui/core';
import { Title, Link as LinkIcon } from '@material-ui/icons';
import {
  Entity,
  fetchInstrumentCount,
  fetchInstrumentDetails,
  fetchInstruments,
  Filter,
  Instrument,
  pushPageFilter,
  pushPageNum,
  pushQuery,
  tableLink,
  TextColumnFilter,
} from 'datagateway-common';
import { QueryParams } from 'datagateway-common/lib/state/app.types';
import React from 'react';
import { connect } from 'react-redux';
import { IndexRange } from 'react-virtualized';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import InstrumentDetailsPanel from '../../detailsPanels/isis/instrumentDetailsPanel.component';
import CardView from '../cardView.component';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISInstrumentsCVDispatchProps {
  fetchData: (offsetParams: IndexRange) => Promise<void>;
  fetchCount: () => Promise<void>;
  fetchDetails: (instrumentId: number) => Promise<void>;
  pushPage: (page: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  pushQuery: (query: QueryParams) => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISInstrumentsCVStateProps {
  data: Entity[];
  totalDataCount: number;
  query: QueryParams;
}

type ISISInstrumentsCVCombinedProps = ISISInstrumentsCVDispatchProps &
  ISISInstrumentsCVStateProps;

const ISISInstrumentsCardView = (
  props: ISISInstrumentsCVCombinedProps
): React.ReactElement => {
  const {
    data,
    totalDataCount,
    query,
    fetchData,
    fetchCount,
    fetchDetails,
    pushFilters,
    pushPage,
    pushQuery,
  } = props;

  const filters = query.filters;

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      value={filters[dataKey] as string}
      onChange={(value: string) => pushFilters(dataKey, value ? value : null)}
    />
  );

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
      title={{
        label: 'Name',
        dataKey: 'FULLNAME',
        content: (instrument: Instrument) =>
          tableLink(
            `/browse/instrument/${instrument.ID}/facilityCycle`,
            instrument.FULLNAME || instrument.NAME,
            query.view
          ),
        filterComponent: textFilter,
      }}
      description={{
        label: 'Description',
        dataKey: 'DESCRIPTION',
        filterComponent: textFilter,
      }}
      information={[
        {
          icon: <Title />,
          label: 'Type',
          dataKey: 'TYPE',
          filterComponent: textFilter,
        },
        {
          icon: <LinkIcon />,
          label: 'URL',
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
    query: state.dgcommon.query,
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
  pushQuery: (query: QueryParams) => dispatch(pushQuery(query)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISInstrumentsCardView);
