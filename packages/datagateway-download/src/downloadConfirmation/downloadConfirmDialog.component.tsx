import React from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions as MuiDialogActions,
  DialogContent as MuiDialogContent,
  DialogTitle as MuiDialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  Select,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { DownloadTypeStatus } from '../downloadApi';
import { downloadPreparedCart } from '../downloadApi';

import { DownloadSettingsContext } from '../ConfigProvider';
import { Trans, useTranslation } from 'react-i18next';
import {
  useDownload,
  useDownloadTypeStatuses,
  useSubmitCart,
} from '../downloadApiHooks';
import { formatBytes, Mark } from 'datagateway-common';

const TableContentDiv = styled('div')(({ theme }) => ({
  paddingTop: '10px',
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
}));

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

const DialogContent = styled(MuiDialogContent)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const DialogActions = styled(MuiDialogActions)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(1),
}));

interface DownloadConfirmDialogProps {
  totalSize: number;
  isTwoLevel: boolean;
  open: boolean;

  redirectToStatusTab: () => void;
  setClose: () => void;
  clearCart: () => void;
}

interface DownloadTypeInfo extends DownloadTypeStatus {
  idsUrl: string;
  displayName?: string;
  description?: string;
}

const DownloadConfirmDialog: React.FC<DownloadConfirmDialogProps> = (
  props: DownloadConfirmDialogProps
) => {
  console.log('<DownloadConfirmDialog />');

  const { totalSize, isTwoLevel, redirectToStatusTab, setClose } = props;

  // Load the settings for use.
  const settings = React.useContext(DownloadSettingsContext);

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

  const [showDialog, setShowDialog] = React.useState(false);

  const downloadTypeStatusQueries = useDownloadTypeStatuses({
    downloadTypes: Object.keys(settings.accessMethods),
    enabled: props.open,
    select: (status) => {
      const info = settings.accessMethods[status.type];
      return info
        ? {
            ...info,
            ...status,
          }
        : {
            type: status.type,
            disabled: undefined,
            message: '',
          };
    },
  });

  const isDownloadTypeStatusesLoadedSuccessfully = downloadTypeStatusQueries.every(
    ({ isLoading, isSuccess }) => !isLoading && isSuccess
  );

  const {
    status,
    data: downloadId,
    mutate: submitCart,
    error: submitCartError,
    isLoading: isSubmittingCart,
    isSuccess: isCartSubmittedSuccessfully,
  } = useSubmitCart();
  console.log({
    status,
    downloadId,
    submitCartError,
    isSubmittingCart,
    isCartSubmittedSuccessfully,
  });
  // query download after cart is submitted
  const {
    data: downloadInfo,
    isSuccess: isDownloadInfoAvailable,
  } = useDownload({
    id: downloadId ?? -1,
    enabled: Boolean(downloadId) && isCartSubmittedSuccessfully,
  });

  /**
   * Maps download types to their corresponding info object
   */
  const downloadTypeInfoMap = React.useMemo(
    () =>
      isDownloadTypeStatusesLoadedSuccessfully
        ? downloadTypeStatusQueries.reduce((m, { data }) => {
            if (data && data.disabled !== undefined) {
              m.set(data.type, data);
            }
            return m;
          }, new Map<string, DownloadTypeInfo>())
        : null,
    [isDownloadTypeStatusesLoadedSuccessfully, downloadTypeStatusQueries]
  );

  /**
   * Sorted download types based on whether they are disabled.
   */
  const sortedDownloadTypes = React.useMemo(
    () =>
      downloadTypeInfoMap
        ? Array.from(downloadTypeInfoMap.values()).sort(
            (methodInfoA, methodInfoB) =>
              (methodInfoA.disabled !== undefined
                ? !methodInfoA.disabled
                  ? -1
                  : 0
                : 1) -
              (methodInfoB.disabled !== undefined
                ? !methodInfoB?.disabled
                  ? -1
                  : 0
                : 1)
          )
        : null,
    [downloadTypeInfoMap]
  );

  // Hide the confirmation dialog and clear the download cart
  // when the dialog is closed.
  const dialogClose = (): void => {
    setClose();
  };

  React.useEffect(() => {
    if (
      props.open &&
      isDownloadTypeStatusesLoadedSuccessfully &&
      sortedDownloadTypes
    ) {
      setShowDialog(true);
    }
  }, [
    props.open,
    isDownloadTypeStatusesLoadedSuccessfully,
    sortedDownloadTypes,
  ]);

  // check if every query for download type status failed
  React.useEffect(() => {
    if (
      downloadTypeStatusQueries.every(
        ({ isLoading, isError }) => !isLoading && isError
      )
    ) {
      setMethodsUnavailable(true);
    }
  }, [downloadTypeStatusQueries]);

  // select the first download method available.
  React.useEffect(() => {
    if (sortedDownloadTypes && sortedDownloadTypes.length > 0) {
      const downloadTypeInfo = sortedDownloadTypes.find(
        ({ disabled }) => disabled !== undefined
      );
      if (downloadTypeInfo && !selectedMethod) {
        setSelectedMethod(downloadTypeInfo.type);
      }
    }
  }, [selectedMethod, sortedDownloadTypes]);

  React.useEffect(() => {
    if (props.open) {
      // Reset checkmark view.
      // Reset all fields for next time dialog is opened.
      setDownloadName('');
      setEmailAddress('');
    }
  }, [props.open]);

  React.useEffect(() => {
    if (!isTwoLevel && props.open) {
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
  }, [isTwoLevel, props.open, totalSize]);

  React.useEffect(() => {
    if (
      isDownloadInfoAvailable &&
      downloadInfo &&
      downloadInfo.status === 'COMPLETE'
    ) {
      // Download the file as long as it is available for instant download.
      downloadPreparedCart(
        downloadInfo.preparedId,
        downloadInfo.fileName,
        // Use the idsUrl that has been defined for this access method.
        { idsUrl: settings.accessMethods[selectedMethod].idsUrl }
      );
    }
  }, [
    downloadInfo,
    isDownloadInfoAvailable,
    selectedMethod,
    settings.accessMethods,
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

  const processDownload = (): void => {
    // Check for file name, if there hasn't been one entered,
    // then generate a default one and update state for rendering later.
    let fileName = downloadName;
    if (!fileName) {
      fileName = getDefaultFileName();
      setDownloadName(fileName);
    }

    submitCart({
      emailAddress,
      fileName,
      transport: selectedMethod,
    });
  };

  return (
    <Dialog
      onClose={dialogClose}
      open={props.open}
      fullWidth={true}
      maxWidth={'sm'}
      aria-label={t('downloadConfirmDialog.dialog_arialabel')}
    >
      {isSubmittingCart || isCartSubmittedSuccessfully ? (
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
              justifyContent="center"
              style={{ paddingBottom: '25px' }}
            >
              <Grid item xs>
                {isCartSubmittedSuccessfully ? (
                  <Mark size={100} visible={props.open} colour="#3e863e" />
                ) : (
                  <Mark
                    size={100}
                    visible={props.open}
                    colour="#a91b2e"
                    isCross={true}
                  />
                )}
              </Grid>

              {isCartSubmittedSuccessfully ? (
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
              {isCartSubmittedSuccessfully && (
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

              {isCartSubmittedSuccessfully && (
                <Grid item xs>
                  <Button
                    id="download-confirmation-status-link"
                    variant="contained"
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
      ) : !showDialog ? (
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
          <DialogTitle id="download-confirm-dialog-title" onClose={dialogClose}>
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
                  variant="standard"
                />
              </Grid>

              {/* Select the access method */}
              <Grid item xs={12}>
                <FormControl
                  sx={{ minWidth: 120 }}
                  error={
                    downloadTypeInfoMap?.get(selectedMethod)?.disabled ||
                    methodsUnavailable
                  }
                  variant="standard"
                >
                  <InputLabel htmlFor="confirm-access-method">
                    {t('downloadConfirmDialog.access_method_label')}
                  </InputLabel>
                  <Select
                    native
                    value={`${methodsUnavailable ? '' : selectedMethod}`}
                    inputProps={{
                      name: 'Access Method',
                      id: 'confirm-access-method',
                    }}
                    onChange={(e) => {
                      if (!methodsUnavailable)
                        // Material UI select is not a real select element, so needs casting.
                        setSelectedMethod(e.target.value as string);
                    }}
                    variant="standard"
                  >
                    {/* Access methods from settings as items for selection */}
                    {sortedDownloadTypes &&
                      sortedDownloadTypes.map(
                        ({ type, ...methodInfo }, index) => {
                          if (methodInfo.disabled !== undefined) {
                            // The display name will be shown as the menu item,
                            // if defined in the settings, otherwise we show the type.
                            const methodName =
                              methodInfo.displayName || type.toUpperCase();
                            return (
                              <option
                                key={index}
                                id={`confirm-access-method-${type}`}
                                aria-label={methodName}
                                value={type}
                                disabled={false}
                              >
                                {methodName}
                              </option>
                            );
                          }
                          return (
                            <option
                              disabled
                              key={index}
                              id={`confirm-access-method-${type}`}
                              aria-label={type.toUpperCase()}
                              value={type}
                            >
                              {type.toUpperCase()}
                            </option>
                          );
                        }
                      )}
                  </Select>

                  <FormHelperText id="confirm-access-method-help">
                    {(() => {
                      const method = downloadTypeInfoMap?.get(selectedMethod);
                      if (!method)
                        return t(
                          'downloadConfirmDialog.access_method_helpertext'
                        );

                      if (methodsUnavailable)
                        return t(
                          'downloadConfirmDialog.access_method_helpertext_all_disabled_error'
                        );

                      if (method.disabled)
                        return (
                          method.message ||
                          t(
                            'downloadConfirmDialog.access_method_helpertext_disabled_error'
                          )
                        );

                      return t(
                        'downloadConfirmDialog.access_method_helpertext'
                      );
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
                        <b>{t('downloadConfirmDialog.access_method_info')}:</b>
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
                  <TableContentDiv>
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
                  </TableContentDiv>
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
                  variant="standard"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button
              id="download-confirmation-download"
              disabled={
                !emailValid ||
                downloadTypeInfoMap?.get(selectedMethod)?.disabled ||
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
      )}
    </Dialog>
  );
};

export default DownloadConfirmDialog;
