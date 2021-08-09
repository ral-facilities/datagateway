import { Button } from '@material-ui/core';
import { GetApp } from '@material-ui/icons';
import {
  downloadDatafile,
  downloadDataset,
  StateType,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface DownloadButtonProps {
  entityType: 'dataset' | 'datafile';
  entityId: number;
  entityName: string;
  variant?: 'text' | 'outlined' | 'contained';
}

const DownloadButton = (props: DownloadButtonProps): JSX.Element => {
  const { entityType, entityId, entityName, variant } = props;
  const [t] = useTranslation();
  const idsUrl = useSelector((state: StateType) => state.dgcommon.urls.idsUrl);

  const downloadData = (
    entityType: 'dataset' | 'datafile',
    entityId: number,
    entityName: string
  ): void => {
    if (entityType === 'dataset') {
      downloadDataset(idsUrl, entityId, entityName);
    } else if (entityType === 'datafile') {
      downloadDatafile(idsUrl, entityId, entityName);
    }
  };

  return (
    <Button
      id="download-btn"
      aria-label="Download"
      variant={variant ?? 'contained'}
      color="primary"
      startIcon={<GetApp />}
      disableElevation
      onClick={() => downloadData(entityType, entityId, entityName)}
    >
      {t('buttons.download')}
    </Button>
  );
};

export default DownloadButton;
