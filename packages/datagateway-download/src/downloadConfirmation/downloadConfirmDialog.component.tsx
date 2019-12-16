import React, { useEffect } from 'react';

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
import {
  Typography,
  IconButton,
  Button,
  TextField,
  Grid,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { formatBytes } from 'datagateway-common';

const dialogTitleStyles = (theme: Theme): StyleRules =>
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

// const dialogStyles = makeStyles((theme: Theme) =>
//   createStyles({
//       container: {
//           display: 'flex',
//           flexWrap: 'wrap',
//       },
//       formControl: {
//           margin: theme.spacing(1),
//           minWidth: 120,
//       },
//   }),
// );

interface DialogTitleProps extends WithStyles<typeof dialogTitleStyles> {
  id: string;
  children: React.ReactNode;

  // TODO: Do we need onClose; another way?
  onClose: () => void;
}

const DialogTitle = withStyles(dialogTitleStyles)((props: DialogTitleProps) => {
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
  totalSize: number;
  setOpen: boolean;
  setClose: () => void;
}

const DownloadConfirmDialog: React.FC<DownloadConfirmDialogProps> = (
  props: DownloadConfirmDialogProps
) => {
  const { totalSize } = props;
  const [connSpeed, setConnSpeed] = React.useState<number>(1);
  const [downloadTime, setDownloadTime] = React.useState<number>(-1);

  //   const classes = dialogStyles();
  // const processDownload = () => {};

  const secondsToDHMS = (seconds: number): string => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const dDisplay = d > 0 ? d + (d === 1 ? ' day, ' : ' days, ') : '';
    const hDisplay = h > 0 ? h + (h === 1 ? ' hour, ' : ' hours, ') : '';
    const mDisplay = m > 0 ? m + (m === 1 ? ' minute, ' : ' minutes, ') : '';
    const sDisplay = s > 0 ? s + (s === 1 ? ' second' : ' seconds') : '';

    return dDisplay + hDisplay + mDisplay + sDisplay;
  };

  useEffect(() => {
    //console.log('Result: ', (totalSize / (1024*1024)) / (connSpeed/8));
    setDownloadTime(totalSize / (1024 * 1024) / (connSpeed / 8));
  }, [connSpeed, totalSize]);

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
        Confirm Your Download
      </DialogTitle>

      {/* The download confirmation form  */}
      <DialogContent>
        <Grid container spacing={2}>
          {/* Set the download name text field */}
          <Grid item xs={12}>
            {/* // TODO: fullWidth={true} works on components normally but we want them to size depending on parent. */}
            <TextField
              id="confirm-download-name"
              label="Download Name"
              defaultValue="ISIS_2019-12-13_11-08-00"
              fullWidth={true}
              required
            />
          </Grid>

          {/* Select the access method */}
          <Grid item xs={12}>
            <FormControl style={{ minWidth: 120 }}>
              <InputLabel id="confirm-access-method-label">
                Access Method
              </InputLabel>
              <Select
                labelId="confirm-access-method"
                id="confirm-access-method"
                defaultValue="https"

                // Show description for each access method
                // onChange={handleChange}
              >
                <MenuItem value="https">HTTPS</MenuItem>
                <MenuItem value="globus">Globus</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Get the size of the download  */}
          <Grid item xs={12}>
            <Typography>
              <b>Download size:</b> {formatBytes(totalSize)}
            </Typography>
          </Grid>

          {/* Select and estimate the download time */}
          <Grid item xs={12}>
            <Typography>My connection speed: </Typography>
            <FormControl style={{ minWidth: 120 }}>
              <Select
                labelId="confirm-download-size"
                id="confirm-download-size"
                defaultValue={1}
                onChange={(
                  event: React.ChangeEvent<{ value: unknown }>
                ): void => {
                  //console.log('Total size: ', totalSize);
                  // console.log(event.target.value);

                  // Material UI select is not a real select element, so needs casting.
                  setConnSpeed(event.target.value as number);
                }}
              >
                <MenuItem value={1}>1 Mbps</MenuItem>
                <MenuItem value={30}>30 Mbps</MenuItem>
                <MenuItem value={100}>100 Mbps</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {/* TODO: Position the download time next to connection speed select dropbox */}
          <Grid item xs={12}>
            <Typography>
              <b>Estimated download time</b> (at {connSpeed} Mbps):{' '}
              {secondsToDHMS(downloadTime)}
            </Typography>
          </Grid>

          {/* Set the download name text field */}
          <Grid item xs={12}>
            {/* // TODO: Email address needs validation? */}
            {/* // TODO: fullWidth={true} works on components normally but we want them to size depending on parent. */}
            <TextField
              id="confirm-download-email"
              label="Email Address (optional)"
              fullWidth={true}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={props.setClose} color="primary" variant="contained">
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DownloadConfirmDialog;
