import { Button, IconButton } from '@material-ui/core';
import { GetApp } from '@material-ui/icons';
import { downloadDatafile } from '../api/datafiles';
import { downloadDataset } from '../api/datasets';
import { downloadInvestigation } from '../api/investigations';
import { StateType } from '../state/app.types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { StyledTooltip } from '../arrowtooltip.component';

export interface DownloadButtonProps {
  entityType: 'investigation' | 'dataset' | 'datafile';
  entityId: number;
  entityName: string | undefined;
  entitySize: number;
  variant?: 'text' | 'outlined' | 'contained' | 'icon';
}

const DownloadButton: React.FC<DownloadButtonProps> = (
  props: DownloadButtonProps
) => {
  const { entityType, entityId, entityName, variant, entitySize } = props;

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
    } else {
      downloadDatafile(idsUrl, entityId, entityName);
    }
  };

  if (!entityName) return null;
  if (variant === 'icon') {
    return (
      <StyledTooltip
        title={
          entitySize <= 0
            ? t<string, string>('buttons.unable_to_download_tooltip')
            : ''
        }
        id={`tooltip-${entityId}`}
        placement="left"
      >
        <span style={{ display: 'inherit' }}>
          <IconButton
            id={`download-btn-${entityId}`}
            aria-label={t('buttons.download')}
            size={'small'}
            onClick={() => {
              downloadData(entityType, entityId, entityName);
            }}
            className="tour-dataview-download"
            disabled={entitySize <= 0}
          >
            <GetApp />
          </IconButton>
        </span>
      </StyledTooltip>
    );
  } else {
    return (
      <StyledTooltip
        title={
          entitySize <= 0
            ? t<string, string>('buttons.unable_to_download_tooltip')
            : ''
        }
        id={`tooltip-${entityId}`}
        placement="bottom"
      >
        <span style={{ display: 'inherit' }}>
          <Button
            id={`download-btn-${entityId}`}
            aria-label="Download"
            variant={variant ?? 'contained'}
            color="primary"
            startIcon={<GetApp />}
            disableElevation
            onClick={() => downloadData(entityType, entityId, entityName)}
            className="tour-dataview-download"
            disabled={entitySize <= 0}
          >
            {t('buttons.download')}
          </Button>
        </span>
      </StyledTooltip>
    );
  }
};

export default DownloadButton;
