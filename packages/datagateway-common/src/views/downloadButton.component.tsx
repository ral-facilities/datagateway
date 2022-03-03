import { Button, IconButton } from '@material-ui/core';
import { GetApp } from '@material-ui/icons';
import { downloadDatafile } from '../api/datafiles';
import { downloadDataset } from '../api/datasets';
import { downloadInvestigation } from '../api/investigations';
import { StateType } from '../state/app.types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

export interface DownloadButtonProps {
  entityType: 'investigation' | 'dataset' | 'datafile';
  entityId: number;
  entityName: string | undefined;
  variant?: 'text' | 'outlined' | 'contained' | 'icon';
}

const DownloadButton: React.FC<DownloadButtonProps> = (
  props: DownloadButtonProps
) => {
  const { entityType, entityId, entityName, variant } = props;
  const [t] = useTranslation();
  const idsUrl = useSelector((state: StateType) => state.dgcommon.urls.idsUrl);

  const downloadData = (
    entityType: 'investigation' | 'dataset' | 'datafile',
    entityId: number,
    entityName: string
  ): void => {
    if (entityType === 'investigation') {
      downloadInvestigation(idsUrl, entityId, entityName);
    } else if (entityType === 'dataset') {
      downloadDataset(idsUrl, entityId, entityName);
    } else if (entityType === 'datafile') {
      downloadDatafile(idsUrl, entityId, entityName);
    }
  };

  if (!entityName) return null;
  if (variant === 'icon') {
    return (
      <IconButton
        id={`download-btn-${entityId}`}
        aria-label={t('buttons.download')}
        size={'small'}
        onClick={() => {
          downloadData(entityType, entityId, entityName);
        }}
        className="tour-dataview-download"
      >
        <GetApp />
      </IconButton>
    );
  } else {
    return (
      <Button
        id={`download-btn-${entityId}`}
        aria-label="Download"
        variant={variant ?? 'contained'}
        color="primary"
        startIcon={<GetApp />}
        disableElevation
        onClick={() => downloadData(entityType, entityId, entityName)}
        className="tour-dataview-download"
      >
        {t('buttons.download')}
      </Button>
    );
  }
};

export default DownloadButton;
