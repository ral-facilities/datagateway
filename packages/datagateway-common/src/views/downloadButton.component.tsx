import { Button, IconButton, Tooltip, Typography, styled } from '@mui/material';
import { GetApp } from '@mui/icons-material';
import { downloadDatafile } from '../api/datafiles';
import { downloadDataset } from '../api/datasets';
import { downloadInvestigation } from '../api/investigations';
import { StateType } from '../state/app.types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

const StyledTooltip = styled(Tooltip)(({ theme }) => ({
  backgroundColor: theme.palette.common.black,
  fontSize: '0.875rem',
}));

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
      <div>
        {entitySize <= 0 ? (
          <StyledTooltip
            title={
              <Typography>{t('buttons.unable_to_download_tooltip')}</Typography>
            }
            id={`tooltip-${entityId}`}
            placement="left"
            arrow
          >
            <span>
              <IconButton
                id={`download-btn-${entityId}`}
                aria-label={t('buttons.download')}
                size={'small'}
                className="tour-dataview-download"
                disabled
              >
                <GetApp />
              </IconButton>
            </span>
          </StyledTooltip>
        ) : (
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
        )}
      </div>
    );
  } else {
    return (
      <div>
        {entitySize <= 0 ? (
          <StyledTooltip
            title={
              <Typography>{t('buttons.unable_to_download_tooltip')}</Typography>
            }
            id={`tooltip-${entityId}`}
            placement="bottom"
            arrow
          >
            <span>
              <Button
                id={`download-btn-${entityId}`}
                aria-label="Download"
                variant={variant ?? 'contained'}
                color="primary"
                startIcon={<GetApp />}
                disableElevation
                className="tour-dataview-download"
                disabled
              >
                {t('buttons.download')}
              </Button>
            </span>
          </StyledTooltip>
        ) : (
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
        )}
      </div>
    );
  }
};

export default DownloadButton;
