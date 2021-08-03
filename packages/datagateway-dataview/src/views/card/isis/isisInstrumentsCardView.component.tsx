import { Link } from '@material-ui/core';
import { Title, Link as LinkIcon } from '@material-ui/icons';
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
  pushQuery,
  tableLink,
  TextColumnFilter,
  TextFilter,
} from 'datagateway-common';
import { QueryParams } from 'datagateway-common/lib/state/app.types';
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
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  pushQuery: (query: QueryParams) => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISInstrumentsCVStateProps {
  data: Entity[];
  totalDataCount: number;
  query: QueryParams;
  loadedData: boolean;
  loadedCount: boolean;
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
    query,
    loadedData,
    loadedCount,
    fetchData,
    fetchCount,
    fetchDetails,
    pushFilters,
    pushPage,
    pushQuery,
    studyHierarchy,
  } = props;

  const [t] = useTranslation();

  const filters = query.filters;

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
      loadedData={loadedData}
      loadedCount={loadedCount}
      title={{
        label: t('instruments.name'),
        dataKey: 'fullName',
        content: (instrument: Instrument) =>
          tableLink(
            `/${pathRoot}/instrument/${instrument.id}/${instrumentChild}`,
            instrument.fullName || instrument.name,
            query.view
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
          content: (instrument: Instrument) =>
            function Content() {
              return <Link href={instrument.url}>{instrument.url}</Link>;
            },
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
  pushQuery: (query: QueryParams) => dispatch(pushQuery(query)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISInstrumentsCardView);
