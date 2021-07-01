import React from 'react';

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

import {
  formatBytes,
  MicroFrontendId,
  NotificationType,
} from 'datagateway-common';
import {
  submitCart,
  getDownload,
  downloadPreparedCart,
  getDownloadTypeStatus,
} from '../downloadApi';

import {
  Theme,
  createStyles,
  withStyles,
  WithStyles,
  StyleRules,
} from '@material-ui/core/styles';
import { DownloadSettingsContext } from '../ConfigProvider';
import { useTranslation, Trans } from 'react-i18next';

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
  const [t] = useTranslation();

  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose && (
        <IconButton
          aria-label={t('downloadConfirmDialog.close_arialabel')}
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

  redirectToStatusTab: () => void;
  setClose: () => void;
  clearCart: () => void;
}

interface DownloadConfirmAccessMethod {
  [type: string]: {
    idsUrl: string;
    displayName?: string;
    description?: string;
    disabled: boolean | undefined;
    message: string;
  };
}

const DownloadConfirmDialog: React.FC<DownloadConfirmDialogProps> = (
  props: DownloadConfirmDialogProps
) => {
  const {
    totalSize,
    isTwoLevel,
    classes,
    redirectToStatusTab,
    setClose,
    clearCart,
  } = props;

  // Load the settings for use.
  const settings = React.useContext(DownloadSettingsContext);

  // Sorting and loading status.
  const [
    statusMethods,
    setStatusMethods,
  ] = React.useState<DownloadConfirmAccessMethod>(
    (): DownloadConfirmAccessMethod => {
      // Create an updated status method with disabled and message properties.
      const defaultStatusMethods: DownloadConfirmAccessMethod = {};
      for (const method in settings.accessMethods)
        defaultStatusMethods[method] = {
          ...settings.accessMethods[method],
          disabled: true,
          message: '',
        };
      return defaultStatusMethods;
    }
  );
  const [requestStatus, setRequestStatus] = React.useState(false);
  const [loadedStatus, setLoadedStatus] = React.useState(false);

  // Create a sorted access methods array to use internally.
  const [sortedMethods, setSortedMethods] = React.useState<
    [
      string,
      {
        idsUrl: string;
        displayName?: string;
        description?: string;
        disabled: boolean | undefined;
        message: string;
      }
    ][]
  >([]);
  const [isSorted, setIsSorted] = React.useState(false);
  const [methodsUnavailable, setMethodsUnavailable] = React.useState(false);

  // Download speed/time table.
  const [showDownloadTime, setShowDownloadTime] = React.useState(true);
  const [timeAtOne, setTimeAtOne] = React.useState(-1);
  const [timeAtThirty, setTimeAtThirty] = React.useState(-1);
  const [timeAtHundred, setTimeAtHundred] = React.useState(-1);

  // Submit values.
  const [downloadName, setDownloadName] = React.useState('');
  const [selectedMethod, setSelectedMethod] = React.useState('');
  const [emailAddress, setEmailAddress] = React.useState('');

  const [t] = useTranslation();

  // Email validation.
  const emailHelpText = t('downloadConfirmDialog.email_help');
  const emailErrorText = t('downloadConfirmDialog.email_error');
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
  const broadcastError = (message: string): void => {
    document.dispatchEvent(
      new CustomEvent(MicroFrontendId, {
        detail: {
          type: NotificationType,
          payload: {
            severity: 'error',
            message,
          },
        },
      })
    );
  };

  // Sort access methods into a sorted array used for
  // rendering the select dropdown list.
  const sortMethods = React.useCallback(() => {
    const sorted = Object.entries(statusMethods).sort(
      ([, methodInfoA], [, methodInfoB]) => {
        const res =
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
        return res;
      }
    );

    // Set the sorted, selected access method
    // and set it to have been sorted.
    setSortedMethods(sorted);
    setSelectedMethod(sorted[0][0]);
    setIsSorted(true);
  }, [statusMethods, setSortedMethods, setSelectedMethod, setIsSorted]);

  React.useEffect(() => {
    async function getStatus(): Promise<void> {
      const statusErrors: string[] = [];
      Promise.all(
        Object.keys(statusMethods).map((method) =>
          getDownloadTypeStatus(method, {
            facilityName: settings.facilityName,
            downloadApiUrl: settings.downloadApiUrl,
          })
        )
      ).then((methodStatuses) => {
        // Loop through all the current access methods and match that
        // to the status information we received for each.
        Object.keys(statusMethods).forEach((method, index) => {
          const status = methodStatuses[index];
          if (status) {
            setStatusMethods((prevState) => {
              return {
                ...prevState,
                [method]: {
                  ...prevState[method],

                  disabled: status.disabled,
                  message: status.message,
                },
              };
            });
          } else {
            setStatusMethods((prevState) => {
              return {
                ...prevState,
                [method]: {
                  ...prevState[method],

                  disabled: undefined,
                  message: '',
                },
              };
            });

            // Push the method type to display an error.
            statusErrors.push(method);
          }
        });

        // Broadcast errors depending on the result of the status requests.
        if (statusErrors.length < Object.keys(statusMethods).length) {
          for (const method of statusErrors) {
            broadcastError(
              t('downloadConfirmDialog.access_method_error', {
                method: method.toUpperCase(),
              })
            );
          }
        } else {
          setMethodsUnavailable(true);
          broadcastError(t('downloadConfirmDialog.access_methods_error'));
        }

        // Set the status information to have been loaded.
        setLoadedStatus(true);
      });
    }

    if (props.open) {
      if (!requestStatus) {
        // Get the status of all the available access methods.
        getStatus();
        setRequestStatus(true);
      } else {
        if (loadedStatus && !isSorted) {
          sortMethods();
          setShowDialog(true);
        }
      }

      // Reset checkmark view.
      setIsSubmitted(false);
      setIsSubmitSuccessful(false);

      // Reset all fields for next time dialog is opened.
      setDownloadName('');
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
    settings.facilityName,
    settings.downloadApiUrl,
    isTwoLevel,
    totalSize,
    statusMethods,
    requestStatus,
    loadedStatus,
    sortMethods,
    isSorted,
    showDialog,
    t,
  ]);

  const getDefaultFileName = (): string => {
    const now = new Date(Date.now());
    const defaultName = `${settings.facilityName}_${now.getFullYear()}-${
      now.getMonth() + 1
    }-${now.getDate()}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;

    return defaultName;
  };

  const secondsToDHMS = (seconds: number): string => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const dDisplay =
      d > 0
        ? d +
          ` ${t('downloadConfirmDialog.day', { count: d })}` +
          (h + m + s > 0 ? ', ' : '')
        : '';
    const hDisplay =
      h > 0
        ? h +
          ` ${t('downloadConfirmDialog.hour', { count: h })}` +
          (m + s > 0 ? ', ' : '')
        : '';
    const mDisplay =
      m > 0
        ? m +
          ` ${t('downloadConfirmDialog.minute', { count: m })}` +
          (s > 0 ? ', ' : '')
        : '';
    const sDisplay =
      s > 0 ? s + ` ${t('downloadConfirmDialog.second', { count: s })}` : '';

    return (
      dDisplay + hDisplay + mDisplay + sDisplay ||
      `< 1 ${t('downloadConfirmDialog.second', { count: 1 })}`
    );
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
      selectedMethod,
      emailAddress,
      fileName,
      {
        facilityName: settings.facilityName,
        downloadApiUrl: settings.downloadApiUrl,
      }
    );

    // Ensure that we have received a downloadId.
    if (downloadId && downloadId !== -1) {
      // If we are using HTTPS then start the download using
      // the download ID we received.
      if (selectedMethod.match(/https|http/)) {
        const downloadInfo = await getDownload(downloadId, {
          facilityName: settings.facilityName,
          downloadApiUrl: settings.downloadApiUrl,
        });

        // Download the file as long as it is available for instant download.
        if (downloadInfo != null && downloadInfo.status === 'COMPLETE')
          downloadPreparedCart(
            downloadInfo.preparedId,
            downloadInfo.fileName,

            // Use the idsUrl that has been defined for this access method.
            { idsUrl: settings.accessMethods[selectedMethod].idsUrl }
          );
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
      aria-label={t('downloadConfirmDialog.dialog_arialabel')}
    >
      {!isSubmitted ? (
        !showDialog ? (
          <DialogContent>
            <div style={{ textAlign: 'center', padding: '25px' }}>
              <CircularProgress />
              <Typography style={{ paddingTop: '10px' }}>
                {t('downloadConfirmDialog.loading_confirmation')}
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
              {t('downloadConfirmDialog.dialog_title')}
            </DialogTitle>

            {/* The download confirmation form  */}
            <DialogContent>
              <Grid container spacing={2}>
                {/* Set the download name text field */}
                <Grid item xs={12}>
                  <TextField
                    id="confirm-download-name"
                    label={t('downloadConfirmDialog.download_name_label')}
                    placeholder={`${getDefaultFileName()}`}
                    fullWidth={true}
                    inputProps={{
                      maxLength: 255,
                    }}
                    onChange={(e) => {
                      setDownloadName(e.target.value as string);
                    }}
                    helperText={t(
                      'downloadConfirmDialog.download_name_helpertext'
                    )}
                  />
                </Grid>

                {/* Select the access method */}
                <Grid item xs={12}>
                  <FormControl
                    style={{ minWidth: 120 }}
                    error={
                      statusMethods[selectedMethod].disabled ||
                      methodsUnavailable
                    }
                  >
                    <InputLabel id="confirm-access-method-label">
                      {t('downloadConfirmDialog.access_method_label')}
                    </InputLabel>
                    <Select
                      labelId="confirm-access-method"
                      id="confirm-access-method"
                      defaultValue={`${
                        methodsUnavailable ? '' : selectedMethod
                      }`}
                      onChange={(e) => {
                        if (!methodsUnavailable)
                          // Material UI select is not a real select element, so needs casting.
                          setSelectedMethod(e.target.value as string);
                      }}
                    >
                      {/* Access methods from settings as items for selection */}
                      {sortedMethods.map(([type, methodInfo], index) => (
                        <MenuItem
                          key={index}
                          id={`confirm-access-method-${type}`}
                          value={type}
                          disabled={methodInfo.disabled === undefined}
                        >
                          {/* The display name will be shown as the menu item,
                          if defined in the settings, otherwise we show the type. */}
                          {methodInfo.displayName
                            ? methodInfo.displayName
                            : type.toUpperCase()}
                        </MenuItem>
                      ))}
                    </Select>

                    <FormHelperText id="confirm-access-method-help">
                      {(() => {
                        const method = statusMethods[selectedMethod];
                        if (methodsUnavailable) {
                          return t(
                            'downloadConfirmDialog.access_method_helpertext_all_disabled_error'
                          );
                        } else if (method.disabled) {
                          if (method.message) {
                            return method.message;
                          } else {
                            return t(
                              'downloadConfirmDialog.access_method_helpertext_disabled_error'
                            );
                          }
                        } else {
                          return t(
                            'downloadConfirmDialog.access_method_helpertext'
                          );
                        }
                      })()}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  {/* Depending on the type of access method that has been selected,
                  show specific access information. */}
                  {Object.entries(settings.accessMethods)
                    .filter(
                      ([type, methodInfo]) =>
                        type === selectedMethod && methodInfo.description
                    )
                    .map(([type, methodInfo], index) => (
                      <span key={index} style={{ paddingTop: '20px' }}>
                        <Typography>
                          <b>
                            {t('downloadConfirmDialog.access_method_info')}:
                          </b>
                        </Typography>

                        <Typography
                          id={`confirm-access-method-${type}-description`}
                          dangerouslySetInnerHTML={{
                            __html: methodInfo.description || '',
                          }}
                        />
                      </span>
                    ))}
                </Grid>

                {/* Get the size of the download  */}
                <Grid item xs={12}>
                  <Typography>
                    <b>{t('downloadConfirmDialog.download_size')}:</b>{' '}
                    {formatBytes(totalSize)}
                  </Typography>
                </Grid>

                {/* Show the estimated download times */}
                {showDownloadTime && (
                  <Grid item xs={12}>
                    <Typography id="estimated-download-times">
                      {t('downloadConfirmDialog.estimated_download_times')}:
                    </Typography>
                    <div
                      style={{ paddingTop: '10px' }}
                      className={classes.tableContent}
                    >
                      <table
                        id="download-table"
                        aria-labelledby="estimated-download-times"
                      >
                        <tbody>
                          <tr>
                            <th>1 Mbps</th>
                            <th>30 Mbps</th>
                            <th>100 Mbps</th>
                          </tr>
                          <tr>
                            <td id="download-table-one">
                              {secondsToDHMS(timeAtOne)}
                            </td>
                            <td id="download-table-thirty">
                              {secondsToDHMS(timeAtThirty)}
                            </td>
                            <td id="download-table-hundred">
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
                    label={t('downloadConfirmDialog.email_label')}
                    fullWidth={true}
                    helperText={emailHelperText}
                    error={!emailValid}
                    inputProps={{
                      maxLength: 254,
                    }}
                    onChange={(e) => {
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
                  statusMethods[selectedMethod].disabled ||
                  methodsUnavailable
                }
                onClick={processDownload}
                color="primary"
                variant="contained"
              >
                {t('downloadConfirmDialog.download')}
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
                    {t('downloadConfirmDialog.download_success')}
                  </Typography>
                </Grid>
              ) : (
                <div
                  id="download-confirmation-unsuccessful"
                  style={{ textAlign: 'center' }}
                >
                  <Typography>
                    <Trans t={t} i18nKey="downloadConfirmDialog.download_error">
                      <b>Your download request was unsuccessful</b>
                      <br />
                      (No download information was received)
                    </Trans>
                  </Typography>
                </div>
              )}

              {/* Grid to show submitted download information */}
              {isSubmitSuccessful && (
                <Grid item xs>
                  <div style={{ textAlign: 'center', margin: '0 auto' }}>
                    <div style={{ float: 'left', textAlign: 'right' }}>
                      <Typography>
                        <b>
                          {t(
                            'downloadConfirmDialog.confirmation_download_name'
                          )}
                          :{' '}
                        </b>
                      </Typography>
                      <Typography>
                        <b>
                          {t(
                            'downloadConfirmDialog.confirmation_access_method'
                          )}
                          :{' '}
                        </b>
                      </Typography>
                      {emailAddress && (
                        <Typography>
                          <b>
                            {t('downloadConfirmDialog.confirmation_email')}:{' '}
                          </b>
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
                        {selectedMethod.toUpperCase()}
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
                  <Button
                    id="download-confirmation-status-link"
                    variant="outlined"
                    color="primary"
                    onClick={redirectToStatusTab}
                  >
                    {t('downloadConfirmDialog.view_my_downloads')}
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

export default withStyles(dialogContentStyles)(DownloadConfirmDialog);
