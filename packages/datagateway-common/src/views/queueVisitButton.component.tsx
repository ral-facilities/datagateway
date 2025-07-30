import { Button } from '@mui/material';
import { RestoreOutlined } from '@mui/icons-material';
import { useQueueAllowed, useQueueVisit } from '../api/cart';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Investigation } from '../app.types';
import DownloadConfirmDialog from '../downloadConfirmation/downloadConfirmDialog.component';
import { useSelector } from 'react-redux';
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
  const accessMethods = useSelector(
    (state: StateType) => state.dgcommon.accessMethods
  );

  const { data: isQueueAllowed } = useQueueAllowed();

  const [showConfirmation, setShowConfirmation] = React.useState(false);

  // log error if we haven't defined access methods to help debug why they're missing from the dropdown if they're not provided
  if (!accessMethods) {
    console.error(
      'Access methods not provided but using QueueVisitButton - please provide access methods in the settings'
    );
  }

  // do not render if user doesn't have permissions
  if (!isQueueAllowed) return <></>;

  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<RestoreOutlined />}
        disableElevation
        onClick={() => setShowConfirmation(true)}
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
