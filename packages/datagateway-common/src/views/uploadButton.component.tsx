import {
  Button,
  ButtonProps,
  IconButton,
  IconButtonProps,
} from '@mui/material';
import { Publish } from '@mui/icons-material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyledTooltip } from '../arrowtooltip.component';
import UploadDialog from './uploadDialog.component';

export interface UploadButtonProps {
  entityType: 'investigation' | 'dataset' | 'datafile';
  entityId: number;
  variant?: 'text' | 'outlined' | 'contained' | 'icon';
}

const UploadButton: React.FC<UploadButtonProps> = (
  props: UploadButtonProps
) => {
  const { entityType, entityId, variant } = props;

  const [t] = useTranslation();

  const [showUploadDialog, setShowUploadDialog] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);

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
            entityType === 'datafile'
              ? 'buttons.upload_datafile'
              : entityType === 'dataset'
              ? 'Upload Datafile'
              : 'Upload Dataset'
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
            entityType !== 'investigation'
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

  return (
    <>
      <StyledTooltip
        open={showTooltip}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title={t(
          entityType === 'investigation'
            ? 'buttons.upload_dataset'
            : 'buttons.upload_datafile'
        )}
        id={`tooltip-${entityId}`}
        placement={variant === 'icon' ? 'left' : 'bottom'}
        arrow
      >
        <span style={variant !== 'icon' ? { margin: 'auto' } : {}}>
          <BaseUploadButton
            onClick={() => {
              setShowTooltip(false);
              setShowUploadDialog(true);
            }}
          />
        </span>
      </StyledTooltip>
      <UploadDialog
        entityType={entityType}
        entityId={entityId}
        open={showUploadDialog}
        setClose={() => setShowUploadDialog(false)}
      />
    </>
  );
};

export default UploadButton;
