import CloseIcon from '@mui/icons-material/Close';
import {
  DialogTitle as MuiDialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface DialogTitleProps {
  id: string;
  onClose: () => void;
  children?: React.ReactNode;
}

const DialogTitle = (props: DialogTitleProps): React.ReactElement => {
  const { children, onClose, ...other } = props;
  const [t] = useTranslation();

  return (
    <MuiDialogTitle sx={{ margin: 0, padding: 2 }} {...other}>
      <Typography sx={{ fontSize: '1.25rem' }}>{children}</Typography>
      {onClose && (
        <IconButton
          aria-label={t('downloadConfirmDialog.close_arialabel')}
          sx={{ position: 'absolute', right: 2, top: 2, color: 'grey[500]' }}
          onClick={onClose}
          size="large"
        >
          <CloseIcon />
        </IconButton>
      )}
    </MuiDialogTitle>
  );
};

export default DialogTitle;
