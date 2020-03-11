import React, { useEffect, useCallback } from 'react';

import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';

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
  CircularProgress,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import Mark from './mark.component';

import { formatBytes } from 'datagateway-common';
import {
  submitCart,
  getDownload,
  downloadPreparedCart,
  getDownloadTypeStatus,
} from '../downloadCart/downloadCartApi';

import {
  Theme,
  createStyles,
  withStyles,
  WithStyles,
  StyleRules,
} from '@material-ui/core/styles';

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

const dialogContentStyles = (): StyleRules =>
  createStyles({
    tableContent: {
      '& table': {
        borderCollapse: 'collapse',
        width: '100%',
      },
      '& th': {
        border: '1px solid #dddddd',
      },
      '& td': {
        border: '1px solid #dddddd',
        textAlign: 'center',
      },
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
      {onClose && (
        <IconButton
          aria-label="download-confirmation-close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      )}
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

interface DownloadConfirmDialogProps
  extends WithStyles<typeof dialogContentStyles> {
  totalSize: number;
  isTwoLevel: boolean;
  open: boolean;

  // TODO: pass in the function to call to redirect to the status tab.
  // setStatus: () => void;
  setClose: () => void;
  clearCart: () => void;
}

interface DownloadConfirmAccessMethod {
  [type: string]: { disabled: boolean | undefined; message: string };
}

// TODO: Do some renaming of variables/methods and clean-up code.
const DownloadConfirmDialog: React.FC<DownloadConfirmDialogProps> = (
  props: DownloadConfirmDialogProps
) => {
  const { classes, setClose, clearCart } = props;

  // TODO: Temporary facilityName until we load it from settings.
  // TODO: Access methods should be configurable and not defined in the component.
  const facilityName = 'LILS';

  // TODO: The default one is now chosen after sorting,
  //       set the initial value of accessMethod to be the first selected item.
  // const defaultAccessMethod = 'https';

  // TODO: Temporary access methods definition until the settings can be merged in.
  const [requestStatus, setRequestStatus] = React.useState(false);
  const [loadedStatus, setLoadedStatus] = React.useState(false);
  const [accessMethods, setAccessMethods] = React.useState<
    DownloadConfirmAccessMethod
  >({
    https: {
      disabled: true,
      message: '',
    },
    globus: {
      disabled: true,
      message: '',
    },
  });

  // TODO: Make interface for this type.
  const [sortedMethods, setSortedMethods] = React.useState<
    [string, { disabled: boolean | undefined; message: string }][]
  >([]);
  const [isSorted, setIsSorted] = React.useState(false);
  const [methodsUnavailable, setMethodsUnavailable] = React.useState(false);

  const { totalSize } = props;
  const { isTwoLevel } = props;

  // Download speed/time table.
  const [showDownloadTime, setShowDownloadTime] = React.useState(true);
  const [timeAtOne, setTimeAtOne] = React.useState(-1);
  const [timeAtThirty, setTimeAtThirty] = React.useState(-1);
  const [timeAtHundred, setTimeAtHundred] = React.useState(-1);

  // Submit values.
  const [downloadName, setDownloadName] = React.useState('');
  // TODO: In the event one access method does not work, select next available.
  // const [accessMethod, setAccessMethod] = React.useState(defaultAccessMethod);
  const [accessMethod, setAccessMethod] = React.useState('');
  const [emailAddress, setEmailAddress] = React.useState('');

  // Email validation.
  const emailHelpText = 'Send me download status messages via email.';
  const emailErrorText = 'Please ensure the email you have entered is valid.';
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const [emailValid, setEmailValid] = React.useState(true);
  const [emailHelperText, setEmailHelperText] = React.useState(emailHelpText);

  // Download button.
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = React.useState(false);

  const [showDialog, setShowDialog] = React.useState(false);

  // Hide the confirmation dialog and clear the download cart
  // when the dialog is closed.
  const dialogClose = (): void => {
    setClose();
    if (isSubmitSuccessful) clearCart();
  };

  // Broadcast a SciGateway notification for any error encountered.
  const broadcastError = (errorMessage: string): void => {
    document.dispatchEvent(
      new CustomEvent('scigateway', {
        detail: {
          type: 'scigateway:api:notification',
          payload: {
            severity: 'error',
            message: errorMessage,
          },
        },
      })
    );
  };

  const sortMethods = useCallback(() => {
    const sorted = Object.entries(accessMethods).sort(
      ([typeA, methodInfoA], [typeB, methodInfoB]) => {
        console.log(typeA, typeB);
        let res =
          (methodInfoA.disabled !== undefined
            ? methodInfoA.disabled === false
              ? -1
              : 0
            : 1) -
          (methodInfoB.disabled !== undefined
            ? methodInfoB.disabled === false
              ? -1
              : 0
            : 1);
        console.log(res);
        return res;
      }
    );

    console.log('Sorted methods: ', sorted);
    setSortedMethods(sorted);
    // Set the selected access method to be the first one in the sorted list.
    setAccessMethod(sorted[0][0]);
    setIsSorted(true);
  }, [accessMethods, setSortedMethods, setAccessMethod, setIsSorted]);

  useEffect(() => {
    async function getStatus(): Promise<void> {
      // TODO: Check to ensure that the states are not being separately updated.
      //       Currently using callback function in order to resolve this (what about Promise.all?)
      //       Have a look at setState asynchronous.

      let statusResults: string[] = [];
      Promise.all(
        Object.entries(accessMethods).map(([method]) =>
          getDownloadTypeStatus(method, 'LILS')
        )
      ).then(methodStatus => {
        console.log(methodStatus);

        Object.entries(accessMethods).forEach(([key, value], index) => {
          console.log('Method status: ', key, index);
          const status = methodStatus[index];
          if (status) {
            setAccessMethods(prevState => {
              return {
                ...prevState,
                [key]: { disabled: status.disabled, message: status.message },
              };
            });
          } else {
            setAccessMethods(prevState => {
              return {
                ...prevState,
                [key]: { disabled: undefined, message: '' },
              };
            });

            // Push the method type to display an error.
            statusResults.push(key);
          }

          // TODO: Temporarily push to a separate array to report information.
          // if (!data) {
          //   statusResults.push(method);
          // }
        });

        console.log('Status errors: ', statusResults);
        if (statusResults.length < Object.keys(accessMethods).length) {
          for (const method of statusResults) {
            broadcastError(
              `Access method ${method.toUpperCase()} is currently unavailable. If required, use an alternative method.`
            );
          }
        } else {
          // TODO: Does not set initially; set after loaded.
          setMethodsUnavailable(true);
          broadcastError(
            'Download access methods are unavailable. Please try again later.'
          );
        }

        // Set the status information to have been loaded.
        setLoadedStatus(true);
      });

      // for (let method in accessMethods) {
      //   const data = await getDownloadTypeStatus(method, 'LILS');
      //   console.log(method, ' Type status: ', data);

      //   if (data) {
      //     setAccessMethods(prevState => {
      //       return {
      //         ...prevState,
      //         [method]: { disabled: data.disabled, message: data.message },
      //       };
      //     });
      //   } else {
      //     setAccessMethods(prevState => {
      //       return {
      //         ...prevState,
      //         [method]: { disabled: undefined, message: '' },
      //       };
      //     });
      //   }

      //   // TODO: Temporarily push to a separate array to report information.
      //   if (!data) {
      //     statusResults.push(method);
      //   }
      // }

      // TODO: Why does printing the access methods here give an incomplete version? Due to asynchronous?
      // TODO: Once all the requests have been complete evaluate if there are any status requests which failed.
      //       If only some failed then show the appropriate SciGateway messages. If all failed then show one message indicating.
      //       Is placing it here after the request good or will the access methods not have been updated yet?
      // console.log('Status errors: ', statusResults);
      // if (statusResults.length < Object.keys(accessMethods).length) {
      //   for (const method of statusResults) {
      //     broadcastError(
      //       `Access method ${method.toUpperCase()} is currently unavailable. If required, use an alternative method.`
      //     );
      //   }
      // } else {
      //   // TODO: Does not set initially; set after loaded.
      //   setMethodsUnavailable(true);
      //   broadcastError(
      //     'Download access methods are unavailable. Please try again later.'
      //   );
      // }

      // setLoadedStatus(true);
    }

    if (props.open) {
      if (!requestStatus) {
        // Get the status of all the available access methods.
        getStatus();
        setRequestStatus(true);
      }

      // TODO: Set loadedStatus to be true only after the access methods have been sorted.
      // TODO: Sort the access methods once the status has been loaded.
      //       Only sort once? We do not request again.
      if (loadedStatus && !isSorted) {
        console.log('Loaded status information: ', loadedStatus);
        console.log('Loaded: ', accessMethods);
        sortMethods();

        // Show the dialog.
        setShowDialog(true);
      }

      // Reset checkmark view.
      setIsSubmitted(false);
      setIsSubmitSuccessful(false);

      // Reset all fields for next time dialog is opened.
      setDownloadName('');
      // TODO: This should no longer be set here and be set after sorting.
      // setAccessMethod(defaultAccessMethod);
      setEmailAddress('');

      if (!isTwoLevel) {
        // Calculate the download times as storage is not two-level;
        // varied for 1 Mbps, 30 Mbps and 100 Mbps.
        setTimeAtOne(totalSize / (1024 * 1024) / (1 / 8));
        setTimeAtThirty(totalSize / (1024 * 1024) / (30 / 8));
        setTimeAtHundred(totalSize / (1024 * 1024) / (100 / 8));
      } else {
        // If storage on IDS server is two-level,
        // then do not show the download speed/time table.
        setShowDownloadTime(false);
      }
    }
  }, [
    props.open,
    accessMethods,
    isTwoLevel,
    totalSize,
    requestStatus,
    loadedStatus,
    sortMethods,
    isSorted,
    showDialog,
  ]);

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

    const dDisplay =
      d > 0
        ? d + (d === 1 ? ' day' : ' days') + (h + m + s > 0 ? ', ' : '')
        : '';
    const hDisplay =
      h > 0 ? h + (h === 1 ? ' hour' : ' hours') + (m + s > 0 ? ', ' : '') : '';
    const mDisplay = m > 0 ? m + (s > 0 ? ' min, ' : ' min') : '';
    const sDisplay = s > 0 ? s + ' sec' : '';

    return dDisplay + hDisplay + mDisplay + sDisplay || '< 1 second';
  };

  const processDownload = async (): Promise<void> => {
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

    // Ensure that we have received a downloadId.
    if (downloadId && downloadId !== -1) {
      // If we are using HTTPS then start the download using
      // the download ID we received.
      // TODO: Convert to checking if the access method matches http/https.
      if (accessMethod.match(/https|http/)) {
        const downloadInfo = await getDownload(facilityName, downloadId);

        // Download the file as long as it is available for immediate download.
        if (downloadInfo != null && downloadInfo.status === 'COMPLETE')
          downloadPreparedCart(downloadInfo.preparedId, downloadInfo.fileName);
      }

      setIsSubmitSuccessful(true);
    }

    // Enable submitted view.
    setIsSubmitted(true);
  };

  return (
    <Dialog
      onClose={dialogClose}
      open={props.open}
      fullWidth={true}
      maxWidth={'sm'}
      aria-label="download-confirm-dialog"
    >
      {!isSubmitted ? (
        // TODO: Is it possible to have a circular progress and then set this when status has loaded?
        !showDialog ? (
          <DialogContent>
            <div style={{ textAlign: 'center', padding: '25px' }}>
              {/* TODO: Bad performance without disableShrink property? */}
              <CircularProgress disableShrink />
              <Typography style={{ paddingTop: '10px' }}>
                Loading Confirmation...
              </Typography>
            </div>
          </DialogContent>
        ) : (
          <div>
            {/* Custom title component which has a close button */}
            <DialogTitle
              id="download-confirm-dialog-title"
              onClose={dialogClose}
            >
              Confirm Your Download
            </DialogTitle>

            {/* The download confirmation form  */}
            <DialogContent>
              <Grid container spacing={2}>
                {/* Set the download name text field */}
                <Grid item xs={12}>
                  <TextField
                    id="confirm-download-name"
                    label="Download Name (optional)"
                    placeholder={`${getDefaultFileName()}`}
                    fullWidth={true}
                    inputProps={{
                      maxLength: 255,
                    }}
                    onChange={e => {
                      setDownloadName(e.target.value as string);
                    }}
                    helperText="Enter a custom file name or leave as the default format (facility_date_time)."
                  />
                </Grid>

                {/* Select the access method */}
                {/* TODO: Grey out the access method if the request for it failed (if it is undefined).
                    Show a push notification (or maybe a message underneath highlighting that
                    following access method is not available). */}
                <Grid item xs={12}>
                  <FormControl
                    style={{ minWidth: 120 }}
                    // TODO: Set error when no access methods selected?
                    //       Allow for none to be selected?
                    error={
                      accessMethods[accessMethod].disabled || methodsUnavailable
                    }
                  >
                    <InputLabel id="confirm-access-method-label">
                      Access Method
                    </InputLabel>
                    <Select
                      labelId="confirm-access-method"
                      id="confirm-access-method"
                      aria-label="confirm-access-method"
                      // TODO: Works when all are undefined, but what should happen when only one/several
                      //       access methods are available? (select the next available by default?)
                      // TODO: Prevent null error when indexing sortedMethod here
                      //       (getting the first element access method name in the sorted list).
                      // TODO: sortMethods[0][0] should be set as the accessMethod value after sorting.
                      defaultValue={`${
                        methodsUnavailable ? '' : sortedMethods[0][0]
                      }`}
                      onChange={e => {
                        // Material UI select is not a real select element, so needs casting.
                        if (!methodsUnavailable)
                          setAccessMethod(e.target.value as string);
                      }}
                    >
                      {/* TODO: Show placeholder in which users can select from in the event all are undefined. */}
                      {/* TODO: Values need to be retrieved from an object from settings. */}
                      {/* TODO: Disable any access methods for which we cannot
                              retrieve the status of. */}
                      {/* TODO: Temporarily specified the keys of the access methods;
                          this code will change to add in the disabled prop to the loop
                          which creates the menu items (from settings branch). */}

                      {/* Access methods are only disabled when do not receive an appropriate response from the API
                    (so they are set as undefined). */}
                      {/* {(() => {
                      if (methodsUnavailable)
                        return (
                          <MenuItem value="">
                            <em>Access Methods</em>
                          </MenuItem>
                        );
                    })()} */}

                      {/* TODO: MenuItems displayed in the dropdown the list should be sorted by the 
                          disabled/undefined access methods. */}
                      {sortedMethods.map(([type, methodInfo], index) => (
                        <MenuItem
                          key={index}
                          id={`confirm-access-method-${type}`}
                          value={type}
                          // TODO: Add in disabled prop.
                          disabled={methodInfo.disabled === undefined}
                        >
                          {type.toUpperCase()}
                        </MenuItem>
                      ))}

                      {/* // <MenuItem
                    //   disabled={accessMethods['https'].disabled === undefined}
                    //   id="confirm-access-method-https"
                    //   value="https"
                    // >
                    //   HTTPS
                    // </MenuItem>

                    // <MenuItem
                    //   disabled={accessMethods['globus'].disabled === undefined}
                    //   id="confirm-access-method-globus"
                    //   value="globus"
                    // >
                    //   Globus
                    // </MenuItem> */}
                    </Select>

                    {/* TODO: Is it possible to avoid putting an immediate function here? */}
                    {(() => {
                      const method = accessMethods[accessMethod];
                      if (methodsUnavailable) {
                        return (
                          <FormHelperText>
                            Access methods currently unavailable.
                          </FormHelperText>
                        );
                      } else if (method.disabled) {
                        if (method.message) {
                          return (
                            <FormHelperText>{method.message}</FormHelperText>
                          );
                        } else {
                          return (
                            <FormHelperText>
                              This access method is currently disabled.
                            </FormHelperText>
                          );
                        }
                      } else {
                        return (
                          <FormHelperText>
                            Select an access method for download.
                          </FormHelperText>
                        );
                      }
                    })()}

                    {/* Provide some information on the selected access method. */}
                    <Typography style={{ paddingTop: '20px' }}>
                      <b>Access Method Information:</b>
                    </Typography>

                    {/* Depending on the type of access method that has been selected,
                  show specific access information. */}
                    {(() => {
                      let accessMethodInfo;
                      // TODO: Convert to http/https check.
                      if (accessMethod.match(/https|http/))
                        accessMethodInfo =
                          'HTTPS is the default access method.';
                      else if (accessMethod === 'globus')
                        accessMethodInfo = 'Globus is a special access method.';

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

                {/* Show the estimated download times */}
                {showDownloadTime && (
                  <Grid item xs={12}>
                    <Typography>Estimated download times:</Typography>
                    <div
                      style={{ paddingTop: '10px' }}
                      className={classes.tableContent}
                    >
                      <table aria-label="download-table">
                        <tbody>
                          <tr>
                            <th>1 Mbps</th>
                            <th>30 Mbps</th>
                            <th>100 Mbps</th>
                          </tr>
                          <tr>
                            <td aria-label="download-table-one">
                              {secondsToDHMS(timeAtOne)}
                            </td>
                            <td aria-label="download-table-thirty">
                              {secondsToDHMS(timeAtThirty)}
                            </td>
                            <td aria-label="download-table-hundred">
                              {secondsToDHMS(timeAtHundred)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Grid>
                )}

                {/* Set email address text field */}
                <Grid item xs={12}>
                  <TextField
                    id="confirm-download-email"
                    label="Email Address (optional)"
                    fullWidth={true}
                    helperText={emailHelperText}
                    error={!emailValid}
                    inputProps={{
                      maxLength: 254,
                    }}
                    onChange={e => {
                      // Remove whitespaces and allow for the email to be optional.
                      const email = (e.target.value as string).trim();
                      if (email) {
                        if (emailRegex.test(email)) {
                          // Material UI select is not a real select element, so needs casting.
                          setEmailAddress(email);

                          if (emailHelperText !== emailHelpText)
                            setEmailHelperText(emailHelpText);
                          setEmailValid(true);
                        } else {
                          if (emailHelperText !== emailErrorText)
                            setEmailHelperText(emailErrorText);
                          setEmailValid(false);
                        }
                      } else {
                        // Allow for the red highlighted error to toggle off,
                        // if there is no longer an email entered in the text field.
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
                disabled={
                  !emailValid ||
                  accessMethods[accessMethod].disabled ||
                  methodsUnavailable
                }
                onClick={processDownload}
                color="primary"
                variant="contained"
              >
                Download
              </Button>
            </DialogActions>
          </div>
        )
      ) : (
        <div>
          <DialogTitle
            id="download-confirm-dialog-title"
            onClose={dialogClose}
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
                  <Mark size={100} colour="#3E863E" visible={props.open} />
                ) : (
                  <Mark
                    size={100}
                    colour="#A91B2E"
                    isCross={true}
                    visible={props.open}
                  />
                )}
              </Grid>

              {isSubmitSuccessful ? (
                <Grid item xs>
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
export default withStyles(dialogContentStyles)(DownloadConfirmDialog);
