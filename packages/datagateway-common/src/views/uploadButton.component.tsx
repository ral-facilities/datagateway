import {
  Button,
  ButtonProps,
  IconButton,
  IconButtonProps,
} from '@mui/material';
import { Publish } from '@mui/icons-material';
// import { uploadDatafile } from '../api/datafiles';
// import { uploadDataset } from '../api/datasets';
// import { StateType } from '../state/app.types';
import React from 'react';
import { useTranslation } from 'react-i18next';
// import { useSelector } from 'react-redux';
import { StyledTooltip } from '../arrowtooltip.component';

export interface UploadButtonProps {
  entityType: 'investigation' | 'dataset' | 'datafile';
  entityId: number;
  entityName: string | undefined;
  variant?: 'text' | 'outlined' | 'contained' | 'icon';
}

const UploadButton: React.FC<UploadButtonProps> = (
  props: UploadButtonProps
) => {
  const { entityType, entityId, entityName, variant } = props;

  const [t] = useTranslation();
  // const idsUrl = useSelector((state: StateType) => state.dgcommon.urls.idsUrl);

  const uploadData = (
    entityType: 'investigation' | 'dataset' | 'datafile',
    entityId: number,
    entityName: string
  ): void => {
    if (entityType === 'investigation') {
      // uploadDataset(idsUrl, entityId, entityName);
    } else {
      // uploadDatafile(idsUrl, entityId, entityName);
    }
  };

  const BaseUploadButton = React.useCallback(
    (props: ButtonProps & IconButtonProps): React.ReactElement => {
      const OurButton = (props: ButtonProps): React.ReactElement => (
        <Button
          variant={variant && variant !== 'icon' ? variant : 'contained'}
          color="primary"
          startIcon={<Publish />}
          disableElevation
          {...props}
        >
          {t(
            entityType !== 'investigation'
              ? 'buttons.upload_datafile'
              : 'buttons.upload_dataset'
          )}
        </Button>
      );
      const OurIconButton = (props: IconButtonProps): React.ReactElement => (
        <IconButton size={'small'} {...props}>
          <Publish />
        </IconButton>
      );
      const ButtonToUse = variant === 'icon' ? OurIconButton : OurButton;
      return (
        <ButtonToUse
          id={`upload-btn-${entityId}`}
          aria-label={t(
            entityType === 'datafile'
              ? 'buttons.upload_datafile'
              : 'buttons.upload_dataset'
          )}
          className="tour-dataview-upload"
          style={{ margin: '5px' }}
          size={entityType === 'datafile' ? 'small' : 'medium'}
          {...props}
        />
      );
    },
    [variant, t, entityId, entityType]
  );
  if (!entityName) return null;
  return (
    <StyledTooltip
      title={
        entityType === 'investigation' ? 'upload dataset' : 'upload datafile'
      }
      id={`tooltip-${entityId}`}
      placement="left"
      arrow
    >
      <span style={variant !== 'icon' ? { margin: 'auto' } : {}}>
        <BaseUploadButton
          onClick={() => {
            uploadData(entityType, entityId, entityName);
            alert(entityType + ': ' + entityId + ': ' + entityName);
          }}
        />
      </span>
    </StyledTooltip>
  );
};

export default UploadButton;
