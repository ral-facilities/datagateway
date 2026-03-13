import { useDataPublication } from 'datagateway-common';
import { useParams } from 'react-router-dom';
import {
  checkDatasetId,
  checkInstrumentAndFacilityCycleId,
  checkInstrumentId,
  checkInvestigationId,
  checkStudyDataPublicationId,
} from '../../page/idCheckFunctions';
import WithIdCheck from '../../page/withIdCheck';
import DatafilePreviewer from './datafilePreviewer.component';

export const ISISDatafilePreviewer = (props: { dataPublication: boolean }) => {
  const {
    instrumentId = '',
    instrumentChildId = '',
    investigationId = '',
    datasetId = '',
    datafileId = '',
  } = useParams();
  const { data, isPending } = useDataPublication(
    parseInt(investigationId),
    props.dataPublication
  );

  const dataPublicationInvestigationId =
    data?.content?.dataCollectionInvestigations?.[0]?.investigation?.id;

  const checkingPromise = props.dataPublication
    ? Promise.all([
        checkInstrumentId(parseInt(instrumentId), parseInt(instrumentChildId)),
        checkStudyDataPublicationId(
          parseInt(instrumentChildId),
          parseInt(investigationId)
        ),
        checkInvestigationId(
          dataPublicationInvestigationId ?? -1,
          parseInt(datasetId)
        ),
        checkDatasetId(parseInt(datasetId), parseInt(datafileId)),
        ...(isPending ? [new Promise(() => undefined)] : []),
      ]).then((values) => !values.includes(false))
    : Promise.all([
        checkInstrumentAndFacilityCycleId(
          parseInt(instrumentId),
          parseInt(instrumentChildId),
          parseInt(investigationId)
        ),
        checkInvestigationId(parseInt(investigationId), parseInt(datasetId)),
        checkDatasetId(parseInt(datasetId), parseInt(datafileId)),
      ]).then((checks) => checks.every((passes) => passes));

  return (
    <WithIdCheck checkingPromise={checkingPromise}>
      <DatafilePreviewer datafileId={parseInt(datafileId)} />
    </WithIdCheck>
  );
};
