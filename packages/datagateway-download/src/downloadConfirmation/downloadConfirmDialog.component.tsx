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
  // FormHelperText,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { formatBytes } from 'datagateway-common';
import {
  submitCart,
  downloadPreparedCart,
  getPreparedId,
} from '../downloadCart/downloadCartApi';
import Mark from './mark.component';

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

interface DialogTitleProps extends WithStyles<typeof dialogTitleStyles> {
  id: string;
  onClose: () => void;
  children?: React.ReactNode;
}

const DialogTitle = withStyles(dialogTitleStyles)((props: DialogTitleProps) => {
  const { classes, children, onClose, ...other } = props;

  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="download-confirmation-close"
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
  isTwoLevel: boolean;
  setOpen: boolean;

  // TODO: pass in the function to call to redirect to the status tab.
  // setStatus: () => void;

  setClose: () => void;
}

const DownloadConfirmDialog: React.FC<DownloadConfirmDialogProps> = (
  props: DownloadConfirmDialogProps
) => {
  // TODO: Temporary facilityName until we load it from settings.
  const facilityName = 'LILS';

  // Access methods should be configurable and not defined in the component.
  const defaultAccessMethod = 'https';
  const { totalSize } = props;
  const { isTwoLevel } = props;

  // Download
  const [showDownloadTime, setShowDownloadTime] = React.useState<boolean>(true);
  const [timeAtOne, setTimeAtOne] = React.useState<number>(-1);
  const [timeAtThirty, setTimeAtThirty] = React.useState<number>(-1);
  const [timeAtHundred, setTimeAtHundred] = React.useState<number>(-1);

  // Submit values.
  const [downloadName, setDownloadName] = React.useState<string>('');
  const [accessMethod, setAccessMethod] = React.useState<string>(
    defaultAccessMethod
  );
  const [emailAddress, setEmailAddress] = React.useState<string>('');

  // Email validation
  const emailHelpText = 'Send me download status messages via email.';
  const emailErrorText = 'Please ensure the email you have entered is valid.';
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const [emailValid, setEmailValid] = React.useState<boolean>(true);
  const [emailHelperText, setEmailHelperText] = React.useState<string>(
    emailHelpText
  );

  // Submission button
  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = React.useState<boolean>(
    false
  );

  useEffect(() => {
    if (props.setOpen) {
      // Reset checkmark view.
      setIsSubmitted(false);
      setIsSubmitSuccessful(false);

      // Reset all fields for next time dialog is opened.
      setDownloadName('');
      setAccessMethod(defaultAccessMethod);
      setEmailAddress('');

      if (!isTwoLevel) {
        // Calculate the download times as storage is not two-level.
        setTimeAtOne(totalSize / (1024 * 1024) / (1 / 8));
        setTimeAtThirty(totalSize / (1024 * 1024) / (30 / 8));
        setTimeAtHundred(totalSize / (1024 * 1024) / (100 / 8));
      } else {
        // If storage on IDS server is two-level,
        // then do not show the download speed/time table.
        setShowDownloadTime(false);
      }
    }
  }, [props.setOpen, isTwoLevel, totalSize]);

  const getDefaultFileName = (): string => {
    const now = new Date();
    let defaultName = `${facilityName}_${now.getFullYear()}-${now.getMonth() +
      1}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;

    return defaultName;
  };

  const secondsToDHMS = (seconds: number): string => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    // TODO: Show as min and sec within a table.
    const dDisplay =
      d > 0
        ? d + (d === 1 ? ' day' : ' days') + (h + m + s > 0 ? ', ' : '')
        : '';
    const hDisplay =
      h > 0 ? h + (h === 1 ? ' hour' : ' hours') + (m + s > 0 ? ', ' : '') : '';
    const mDisplay =
      m > 0 ? m + (m === 1 ? ' minute' : ' minutes') + (s > 0 ? ', ' : '') : '';
    const sDisplay = s > 0 ? s + (s === 1 ? ' second' : ' seconds') : '';

    return dDisplay + hDisplay + mDisplay + sDisplay || '< 1 second';
  };

  const processDownload = async (): Promise<void> => {
    console.log(
      `Submit Cart: ${facilityName}, ${downloadName}, ${accessMethod}, ${emailAddress}`
    );

    // Check for file name, if there hasn't been one entered,
    // then generate a default one and update state for rendering later.
    let fileName = downloadName;
    if (!fileName) {
      fileName = getDefaultFileName();
      setDownloadName(fileName);
    }

    const downloadId = await submitCart(
      facilityName,
      accessMethod,
      emailAddress,
      fileName
    );
    console.log('Returned downloadID ', downloadId);

    // Ensure that we have received a downloadId.
    if (downloadId && downloadId !== -1) {
      // If we are using HTTPS then start the download using
      // the download ID we received.

      // TODO: Check for http and https.
      if (accessMethod === defaultAccessMethod) {
        const preparedId = await getPreparedId(facilityName, downloadId);
        downloadPreparedCart(preparedId, fileName);
      }

      setIsSubmitSuccessful(true);
    }

    // Enable submitted view.
    setIsSubmitted(true);
  };

  return (
    <Dialog
      onClose={props.setClose}
      open={props.setOpen}
      // TODO: Set size another way; should have width without this?
      fullWidth={true}
      maxWidth={'sm'}
      aria-label="download-confirm-dialog"
    >
      {!isSubmitted ? (
        <div>
          {/* Custom title component which has a close button */}
          <DialogTitle
            id="download-confirm-dialog-title"
            onClose={props.setClose}
          >
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
                  label="Download Name (optional)"
                  placeholder={`${getDefaultFileName()}`}
                  fullWidth={true}
                  // TODO: Set a maxLength?
                  inputProps={{
                    maxLength: 255,
                  }}
                  onChange={(
                    event: React.ChangeEvent<{ value: unknown }>
                  ): void => {
                    console.log('Set download name: ', event.target.value);
                    setDownloadName(event.target.value as string);
                  }}
                  helperText="Enter a custom file name or leave as the default format (facility_date_time)."
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
                    aria-label="confirm-access-method"
                    defaultValue={`${defaultAccessMethod}`}
                    onChange={(
                      event: React.ChangeEvent<{ value: unknown }>
                    ): void => {
                      console.log(
                        'Selected access method: ',
                        event.target.value
                      );

                      // Material UI select is not a real select element, so needs casting.
                      setAccessMethod(event.target.value as string);
                    }}
                  >
                    <MenuItem id="confirm-access-method-https" value="https">
                      HTTPS
                    </MenuItem>
                    <MenuItem id="confirm-access-method-globus" value="globus">
                      Globus
                    </MenuItem>
                  </Select>

                  {/* Provide some information on the selected access method. */}
                  <Typography style={{ paddingTop: '20px' }}>
                    <b>Access Method Information:</b>
                  </Typography>

                  {/* TODO: Could this be neater? */}
                  {/* Depending on the type of access method that has been selected,
                  show specific access information. */}
                  {(() => {
                    let accessMethodInfo;
                    switch (accessMethod) {
                      case defaultAccessMethod:
                        accessMethodInfo =
                          'HTTPS is the default access method.';
                        break;

                      case 'globus':
                        accessMethodInfo = 'Globus is a special access method.';
                        break;

                      default:
                        return 'N/A';
                    }

                    return (
                      <Typography id="confirm-access-method-information">
                        {accessMethodInfo}
                      </Typography>
                    );
                  })()}
                </FormControl>
              </Grid>

              {/* Get the size of the download  */}
              <Grid item xs={12}>
                <Typography aria-label="confirm-download-size">
                  <b>Download size:</b> {formatBytes(totalSize)}
                </Typography>
              </Grid>

              {/* Select and estimate the download time */}
              {/* {showDownloadTime && (
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
                        // Material UI select is not a real select element, so needs casting.
                        setConnSpeed(event.target.value as number);
                      }}
                    >
                      <MenuItem id="confirm-connection-speed-1" value={1}>
                        1 Mbps
                      </MenuItem>
                      <MenuItem id="confirm-connection-speed-30" value={30}>
                        30 Mbps
                      </MenuItem>
                      <MenuItem id="confirm-connection-speed-100" value={100}>
                        100 Mbps
                      </MenuItem>
                    </Select>
                    <FormHelperText id="confirm-connection-speed-help">
                      Select a connection speed to approximate download time.
                    </FormHelperText>
                  </FormControl>
                </Grid>
              )} */}

              {/* TODO: Position the download time next to connection speed select dropbox */}
              {/* {showDownloadTime && (
                <Grid item xs={12}>
                  <Typography>
                    <b>Estimated download time</b> (at {connSpeed} Mbps):
                  </Typography>
                  <Typography aria-label="confirm-estimated-time">
                    {secondsToDHMS(downloadTime)}
                  </Typography>
                </Grid>
              )} */}

              {showDownloadTime && (
                <Grid item xs={12}>
                  <Typography>Estimated download times:</Typography>
                  <div style={{ paddingTop: '10px' }}>
                    <table
                      style={{ borderCollapse: 'collapse', width: '100%' }}
                    >
                      <tr>
                        <th style={{ border: '1px solid #dddddd' }}>1 Mbps</th>
                        <th style={{ border: '1px solid #dddddd' }}>30 Mbps</th>
                        <th style={{ border: '1px solid #dddddd' }}>
                          100 Mbps
                        </th>
                      </tr>
                      <tr>
                        <td
                          style={{
                            border: '1px solid #dddddd',
                            textAlign: 'center',
                          }}
                        >
                          {secondsToDHMS(timeAtOne)}
                        </td>
                        <td
                          style={{
                            border: '1px solid #dddddd',
                            textAlign: 'center',
                          }}
                        >
                          {secondsToDHMS(timeAtThirty)}
                        </td>
                        <td
                          style={{
                            border: '1px solid #dddddd',
                            textAlign: 'center',
                          }}
                        >
                          {secondsToDHMS(timeAtHundred)}
                        </td>
                      </tr>
                    </table>
                  </div>
                </Grid>
              )}

              {/* Set email address text field */}
              <Grid item xs={12}>
                {/* // TODO: fullWidth={true} works on components normally but we want them to size depending on parent. */}
                <TextField
                  id="confirm-download-email"
                  label="Email Address (optional)"
                  fullWidth={true}
                  helperText={emailHelperText}
                  error={!emailValid}
                  // TODO: Set a maxLength?
                  inputProps={{
                    maxLength: 254,
                  }}
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
                      setEmailAddress('');
                      setEmailHelperText(emailHelpText);
                      setEmailValid(true);
                    }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button
              id="download-confirmation-download"
              // TODO: Download button disables if email is invalid, potentially use debounce?
              disabled={!emailValid}
              onClick={processDownload}
              color="primary"
              variant="contained"
            >
              Download
            </Button>
          </DialogActions>
        </div>
      ) : (
        <div>
          <DialogTitle
            id="download-confirm-dialog-title"
            onClose={props.setClose}
          />

          <DialogContent>
            <Grid
              container
              spacing={4}
              direction="column"
              alignItems="center"
              justify="center"
              style={{ paddingBottom: '25px' }}
            >
              <Grid item xs>
                {/* TODO: When closing the animation renders again? 
                      Maybe set a fixed width for the dialog and not render it? */}
                {isSubmitSuccessful ? (
                  <Mark size={100} colour="#3E863E" />
                ) : (
                  <Mark size={100} colour="#A91B2E" isCross={true} />
                )}
              </Grid>

              {isSubmitSuccessful ? (
                <Grid item xs>
                  {/* {accessMethod === defaultAccessMethod ? (
                    <Typography id="download-confirmation-success-default">
                      Successfully submitted and started download
                    </Typography>
                  ) : (
                    <Typography id="download-confirmation-success-other">
                      Successfully created download
                    </Typography>
                  )} */}

                  <Typography id="download-confirmation-success">
                    Successfully submitted download request
                  </Typography>
                </Grid>
              ) : (
                <div
                  id="download-confirmation-unsuccessful"
                  style={{ textAlign: 'center' }}
                >
                  <Typography>
                    <b>Your download request was unsuccessful</b>
                  </Typography>
                  <Typography>
                    (No download information was received)
                  </Typography>
                </div>
              )}

              {/* Grid to show submitted download information */}
              {isSubmitSuccessful && (
                <Grid item xs>
                  <div style={{ textAlign: 'center', margin: '0 auto' }}>
                    <div style={{ float: 'left', textAlign: 'right' }}>
                      <Typography>
                        <b>Download Name: </b>
                      </Typography>
                      <Typography>
                        <b>Access Method: </b>
                      </Typography>
                      {emailAddress && (
                        <Typography>
                          <b>Email Address: </b>
                        </Typography>
                      )}
                    </div>
                    <div
                      style={{
                        float: 'right',
                        textAlign: 'left',
                        paddingLeft: '25px',
                      }}
                    >
                      <Typography id="confirm-success-download-name">
                        {downloadName}
                      </Typography>
                      <Typography id="confirm-success-access-method">
                        {accessMethod.toUpperCase()}
                      </Typography>
                      {emailAddress && (
                        <Typography id="confirm-success-email-address">
                          {emailAddress}
                        </Typography>
                      )}
                    </div>
                  </div>
                </Grid>
              )}

              {isSubmitSuccessful && (
                <Grid item xs>
                  {/* TODO: Button needs to call a function that has been passed in
                        which allow for the tab to be changed to the status page. */}
                  <Button
                    id="download-confirmation-status-link"
                    variant="outlined"
                    color="primary"
                    href="/"
                  >
                    View My Downloads
                  </Button>
                </Grid>
              )}
            </Grid>
          </DialogContent>
        </div>
      )}
    </Dialog>
  );
};

// TODO: Pass in facilityName as prop to DownloadConfirmDialog to get customisable download name.

export default DownloadConfirmDialog;
