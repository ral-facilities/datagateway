import RestoreOutlined from '@mui/icons-material/RestoreOutlined';
import { Button } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useDownloadTypes, useQueueAllowed, useQueueVisit } from '../api/cart';
import { Investigation } from '../app.types';
import DownloadConfirmDialog from '../downloadConfirmation/downloadConfirmDialog.component';
import { StateType } from '../state/app.types';

interface QueueVisitButtonProps {
  investigation: Investigation;
}

const QueueVisitButton: React.FC<QueueVisitButtonProps> = (props) => {
  const { investigation } = props;
  const [t] = useTranslation();

  const downloadApiUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.downloadApiUrl
  );
  const facilityName = useSelector(
    (state: StateType) => state.dgcommon.facilityName
  );

  const { data: accessMethods, refetch: refetchDownloadTypes } =
    useDownloadTypes(facilityName, downloadApiUrl);

  const { data: isQueueAllowed } = useQueueAllowed();

  const [showConfirmation, setShowConfirmation] = React.useState(false);

  // do not render if user doesn't have permissions
  if (!isQueueAllowed) return <></>;

  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<RestoreOutlined />}
        disableElevation
        onClick={() => {
          // refetch the download types when opening the dialogue to ensure statuses are up to date
          refetchDownloadTypes();
          setShowConfirmation(true);
        }}
      >
        {t('buttons.queue_visit')}
      </Button>
      {/* Show the download confirmation dialog. */}
      <DownloadConfirmDialog
        totalSize={investigation.fileSize ?? -1}
        isTwoLevel={true}
        facilityName={facilityName}
        downloadApiUrl={downloadApiUrl}
        accessMethods={accessMethods ?? {}}
        open={showConfirmation}
        visitId={investigation.visitId}
        submitDownloadHook={useQueueVisit}
        setClose={() => setShowConfirmation(false)}
      />
    </>
  );
};

export default QueueVisitButton;
