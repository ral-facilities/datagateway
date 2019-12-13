import React from 'react';

import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import {
  Theme,
  createStyles,
  withStyles,
  WithStyles,
  StyleRules,
} from '@material-ui/core/styles';
import { Typography, IconButton, Button } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

interface DialogTitleProps extends WithStyles<typeof styles> {
  id: string;
  children: React.ReactNode;

  // TODO: Do we need onClose; another way?
  onClose: () => void;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { classes, children, onClose, ...other } = props;

  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

interface DownloadConfirmDialogProps {
  setOpen: boolean;
  setClose: () => void;
}

// const dialogStyles = (theme: Theme) =>
//     createStyles({
//         root: {
//             margin: 0,
//             padding: theme.spacing(2),
//         },
//         closeButton: {
//             position: 'absolute',
//             right: theme.spacing(1),
//             top: theme.spacing(1),
//             color: theme.palette.grey[500],
//         },
//     });

const DownloadConfirmDialog: React.FC<DownloadConfirmDialogProps> = (
  props: DownloadConfirmDialogProps
) => {
  //   const [open, setOpen] = React.useState(true);

  //   const handleClickOpen = () => {
  //       setOpen(true);
  //   };

  //   const handleClose = () => {
  //       setOpen(false);
  //   };

  return (
    <Dialog
      onClose={props.setClose}
      aria-labelledby="download-confirmation-dialog"
      open={props.setOpen}
      // TODO: Set size another way; should have width without this?
      fullWidth={true}
      maxWidth={'sm'}
    >
      <DialogTitle id="download-confirm-dialog-title" onClose={props.setClose}>
        Download Confirmation
      </DialogTitle>

      <DialogContent></DialogContent>

      <DialogActions>
        <Button onClick={props.setClose} color="primary">
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DownloadConfirmDialog;
