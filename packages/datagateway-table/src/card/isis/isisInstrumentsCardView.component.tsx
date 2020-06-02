import React from 'react';
import CardView from '../cardView.component';
import { StateType } from '../../state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import {
  Entity,
  fetchInstrumentCount,
  fetchInstruments,
  fetchInstrumentDetails,
  Instrument,
  tableLink,
} from 'datagateway-common';
import { IndexRange } from 'react-virtualized';
import { ViewsType } from 'datagateway-common/lib/state/app.types';
import { Link } from '@material-ui/core'; //  Typography

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISInstrumentsCVDispatchProps {
  fetchData: (offsetParams: IndexRange) => Promise<void>;
  fetchCount: () => Promise<void>;
  fetchDetails: (instrumentId: number) => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISInstrumentsCVStateProps {
  data: Entity[];
  totalDataCount: number;
  view: ViewsType;
}

type ISISInstrumentsCVCombinedProps = ISISInstrumentsCVDispatchProps &
  ISISInstrumentsCVStateProps;

const ISISInstrumentsCardView = (
  props: ISISInstrumentsCVCombinedProps
): React.ReactElement => {
  const {
    data,
    totalDataCount,
    fetchData,
    fetchCount,
    fetchDetails,
    view,
  } = props;

  const [fetchedCount, setFetchedCount] = React.useState(false);

  React.useEffect(() => {
    // TODO: Only request these once all data has loaded or provide a button/collapsible for this.
    // data.forEach(d => {
    //   const instrument = d as Instrument;
    //   console.log('instrument: ', instrument);
    //   if (!instrument.INSTRUMENTSCIENTIST) {
    //     fetchDetails(instrument.ID);
    //   }
    // });

    // Load count to trigger data to be fetched.
    if (!fetchedCount) {
      fetchCount();
      setFetchedCount(true);
    }
  }, [data, fetchedCount, fetchCount, setFetchedCount, fetchDetails]);

  return (
    <CardView
      data={data}
      totalDataCount={totalDataCount}
      loadData={fetchData}
      title={{
        dataKey: 'FULLNAME',
        content: (instrument: Instrument) =>
          tableLink(
            `/browse/instrument/${instrument.ID}/facilityCycle`,
            instrument.FULLNAME || instrument.NAME,
            view
          ),
      }}
      description={{ dataKey: 'DESCRIPTION' }}
      furtherInformation={[
        {
          label: 'Type',
          dataKey: 'TYPE',
        },
        {
          label: 'URL',
          dataKey: 'URL',
          // eslint-disable-next-line react/display-name
          content: (instrument: Instrument) => (
            <Link href={instrument.URL}>{instrument.URL}</Link>
          ),
        },
        // TODO: Needs a different way of showing information (only when requested by user)
        //       and not all at once.
        // {
        //   label: 'Instrument Scientists',
        //   // TODO: How to handle dataKey when content only?
        //   dataKey: 'INSTRUMENTSCIENTIST',
        //   content: (instrument: Instrument) => {
        //     if (instrument.INSTRUMENTSCIENTIST) {
        //       return (
        //         <div>
        //           {instrument.INSTRUMENTSCIENTIST.map(instrumentScientist => {
        //             if (instrumentScientist.USER_) {
        //               return (
        //                 <Typography
        //                   key={instrumentScientist.USER_ID}
        //                   variant="body2"
        //                 >
        //                   {instrumentScientist.USER_.FULL_NAME ||
        //                     instrumentScientist.USER_.NAME}
        //                 </Typography>
        //               );
        //             } else {
        //               return null;
        //             }
        //           })}
        //         </div>
        //       );
        //     }
        //   },
        // },
      ]}
    />
  );
};

const mapStateToProps = (state: StateType): ISISInstrumentsCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    view: state.dgcommon.query.view,
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
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISInstrumentsCardView);
