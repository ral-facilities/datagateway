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
  FormHelperText,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { formatBytes } from 'datagateway-common';
import {
  submitCart,
  downloadPreparedCart,
} from '../downloadCart/downloadCartApi';

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
  //   const classes = dialogStyles();
  // TODO: Temporary facilityName until we load it from settings.

  const facilityName = 'LILS';
  const defaultAccessMethod = 'https';

  const { totalSize } = props;
  const [connSpeed, setConnSpeed] = React.useState<number>(1);
  const [downloadTime, setDownloadTime] = React.useState<number>(-1);

  // Form values
  const [downloadName, setDownloadName] = React.useState<string>('');
  // let fileName: string = getDefaultFileName();
  const [accessMethod, setAccessMethod] = React.useState<string>(
    defaultAccessMethod
  );
  const [emailAddress, setEmailAddress] = React.useState<string>('');

  const emailHelpText = 'Send me download status messages via email.';
  const emailErrorText = 'Please ensure the email you have entered is valid.';
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const [emailValid, setEmailValid] = React.useState<boolean>(true);
  const [emailHelperText, setEmailHelperText] = React.useState<string>(
    emailHelpText
  );

  const getDefaultFileName = (): string => {
    const now = new Date();
    let defaultName = `${facilityName}_${now.getFullYear()}-${now.getMonth() +
      1}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;

    return defaultName;
  };

  useEffect(() => {
    setDownloadTime(totalSize / (1024 * 1024) / (connSpeed / 8));
  }, [connSpeed, totalSize]);

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

  const processDownload = async (): Promise<void> => {
    console.log(
      `Submit Cart: ${facilityName}, ${downloadName}, ${accessMethod}, ${emailAddress}`
    );

    // Check for file name, if there hasn't been one entered, then generate a default one.
    let fileName = downloadName;
    if (!fileName) fileName = getDefaultFileName();

    const downloadId = await submitCart(
      facilityName,
      accessMethod,
      emailAddress,
      fileName
    );
    console.log('Returned downloadID ', downloadId);

    // Start the download using the downloadId we received.
    downloadPreparedCart(downloadId);
  };

  return totalSize > 0 ? (
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
            {/* <FormControl> */}
            {/* // TODO: fullWidth={true} works on components normally but we want them to size depending on parent. */}
            <TextField
              id="confirm-download-name"
              label="Download Name (optional)"
              // TODO: We can't set the defaultName to the setFileName useState,
              //       so instead we use a normal variable.
              // defaultValue={`${getDefaultFileName()}`}
              // defaultValue={`${fileName}`}
              placeholder={`${getDefaultFileName()}`}
              fullWidth={true}
              onChange={(
                event: React.ChangeEvent<{ value: unknown }>
              ): void => {
                console.log('Set download name: ', event.target.value);
                setDownloadName(event.target.value as string);
              }}
              helperText="Enter a custom file name or leave as the default format (facility_date_time)."
            />
            {/* </FormControl> */}
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
                defaultValue={`${defaultAccessMethod}`}
                onChange={(
                  event: React.ChangeEvent<{ value: unknown }>
                ): void => {
                  console.log('Selected access method: ', event.target.value);

                  // Material UI select is not a real select element, so needs casting.
                  setAccessMethod(event.target.value as string);
                }}
              >
                <MenuItem value="https">HTTPS</MenuItem>
                <MenuItem value="globus">Globus</MenuItem>
              </Select>

              {/* Provide some information on the selected access method. */}
              <Typography>
                <b>Access Method Information:</b>
              </Typography>

              {accessMethod === defaultAccessMethod && (
                <Typography>HTTPS is the default access method.</Typography>
              )}

              {accessMethod === 'globus' && (
                <Typography>Globus is a special access method.</Typography>
              )}
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
                labelId="confirm-connection-speed"
                id="confirm-connection-speed"
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
              <FormHelperText id="confirm-connection-speed-help">
                Select a connection speed to approximate download time.
              </FormHelperText>
            </FormControl>
          </Grid>
          {/* TODO: Position the download time next to connection speed select dropbox */}
          <Grid item xs={12}>
            <Typography>
              <b>Estimated download time</b> (at {connSpeed} Mbps):
            </Typography>
            <Typography>{secondsToDHMS(downloadTime)}</Typography>
          </Grid>

          {/* Set the download name text field */}
          <Grid item xs={12}>
            {/* <FormControl> */}
            {/* // TODO: Email address needs validation? */}
            {/* // TODO: fullWidth={true} works on components normally but we want them to size depending on parent. */}
            <TextField
              id="confirm-download-email"
              label="Email Address (optional)"
              fullWidth={true}
              helperText={emailHelperText}
              error={!emailValid}
              // TODO: We could use debounce to evaluate if the email address is valid
              //       after the user has finished typing it.
              onChange={(
                event: React.ChangeEvent<{ value: unknown }>
              ): void => {
                console.log(
                  'Changed email address: ',
                  event.target.value as string
                );

                // Remove whitespaces and allow for the email to be optional.
                const email = (event.target.value as string).trim();
                if (email) {
                  if (emailRegex.test(email)) {
                    // Material UI select is not a real select element, so needs casting.
                    setEmailAddress(email);

                    if (emailHelperText !== emailHelpText)
                      setEmailHelperText(emailHelpText);
                    setEmailValid(true);

                    console.log('Set valid email');
                  } else {
                    if (emailHelperText !== emailErrorText)
                      setEmailHelperText(emailErrorText);
                    setEmailValid(false);

                    console.log('Set invalid email');
                  }
                } else if (!emailValid) {
                  // Allow for the error to toggle off, if there is
                  // no longer an email entered in the text field.
                  setEmailHelperText(emailHelpText);
                  setEmailValid(true);
                }
              }}
            />
            {/* </FormControl> */}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button
          // TODO: Download button disables if email is invalid, potentially use debounce?
          disabled={!emailValid}
          onClick={processDownload}
          color="primary"
          variant="contained"
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  ) : null;
};

// TODO: Pass in facilityName as prop to DownloadConfirmDialog to get customisable name.

export default DownloadConfirmDialog;
