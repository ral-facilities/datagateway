import {
  Button,
  ButtonProps,
  IconButton,
  IconButtonProps,
} from '@mui/material';
import { GetApp } from '@mui/icons-material';
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

  const BaseDownloadButton = React.useCallback(
    (props: ButtonProps & IconButtonProps): React.ReactElement => {
      const OurButton = (props: ButtonProps): React.ReactElement => (
        <Button
          variant={variant && variant !== 'icon' ? variant : 'contained'}
          color="primary"
          startIcon={<GetApp />}
          disableElevation
          {...props}
        >
          {t('buttons.download')}
        </Button>
      );
      const OurIconButton = (props: IconButtonProps): React.ReactElement => (
        <IconButton size={'small'} {...props}>
          <GetApp />
        </IconButton>
      );
      const ButtonToUse = variant === 'icon' ? OurIconButton : OurButton;
      return (
        <ButtonToUse
          id={`download-btn-${entityId}`}
          aria-label={t('buttons.download')}
          className="tour-dataview-download"
          {...props}
        />
      );
    },
    [variant, t, entityId]
  );
  if (!entityName) return null;
  return (
    <StyledTooltip
      title={
        entitySize <= 0
          ? t<string, string>('buttons.unable_to_download_tooltip')
          : ''
      }
      id={`tooltip-${entityId}`}
      placement="left"
      arrow
    >
      <span style={variant !== 'icon' ? { margin: 'auto' } : {}}>
        <BaseDownloadButton
          onClick={() => {
            downloadData(entityType, entityId, entityName);
          }}
          disabled={entitySize <= 0}
        />
      </span>
    </StyledTooltip>
  );
};

export default DownloadButton;
