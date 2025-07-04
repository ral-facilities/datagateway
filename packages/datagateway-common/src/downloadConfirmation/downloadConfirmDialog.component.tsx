import {
  Button,
  CircularProgress,
  Dialog,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  DialogActions as MuiDialogActions,
  Select,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatBytes } from '../table/cellRenderers/cellContentRenderers';

import { UseMutateFunction } from '@tanstack/react-query';
import {
  QueueVisitParams,
  SubmitCartParams,
  getDefaultFileName,
  useDownload,
  useDownloadTypeStatuses,
  useQueueVisit,
  useSubmitCart,
} from '../api/cart';
import type {
  Download,
  DownloadSettingsAccessMethod,
  DownloadTypeStatus,
} from '../app.types';
import DialogContent from './dialogContent.component';
import DialogTitle from './dialogTitle.component';
import DownloadRequestResult from './downloadRequestResult.component';

const TableContentDiv = styled('div')(() => ({
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

const DialogActions = styled(MuiDialogActions)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(1),
}));

interface DownloadConfirmDialogProps {
  totalSize: number;
  isTwoLevel: boolean;
  open: boolean;

  facilityName: string;
  downloadApiUrl: string;
  accessMethods: DownloadSettingsAccessMethod;

  visitId?: string;
  submitDownloadHook: typeof useSubmitCart | typeof useQueueVisit;

  redirectToStatusTab?: () => void;
  setClose: () => void;

  postDownloadSuccessFn?: (downloadInfo: Download) => void;
}

interface DownloadTypeInfo extends DownloadTypeStatus {
  idsUrl: string;
  displayName?: string;
  description?: string;
}

const DownloadConfirmDialog: React.FC<DownloadConfirmDialogProps> = (
  props: DownloadConfirmDialogProps
) => {
  const {
    totalSize,
    isTwoLevel,
    redirectToStatusTab,
    setClose,
    facilityName,
    downloadApiUrl,
    accessMethods,
    postDownloadSuccessFn,
    submitDownloadHook,
    visitId,
  } = props;

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
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const [emailValid, setEmailValid] = React.useState(true);
  const [emailHelperText, setEmailHelperText] = React.useState(emailHelpText);

  const downloadTypeStatusQueries = useDownloadTypeStatuses({
    downloadTypes: Object.keys(accessMethods),
    facilityName,
    downloadApiUrl,
    enabled: props.open,
    select: (status) => {
      const info = accessMethods[status.type];
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

  const hasFinishedLoadingDownloadTypeStatuses =
    downloadTypeStatusQueries.every(({ isLoading }) => !isLoading);

  const {
    data: submitDownloadData,
    mutate: submitDownload,
    isLoading: isSubmittingDownload,
    isSuccess: isDownloadSubmittedSuccessfully,
    isError: hasSubmitDownloadFailed,
    reset: resetSubmitDownloadMutation,
  } = submitDownloadHook(facilityName, downloadApiUrl, undefined);

  // query download after cart is submitted
  const {
    data: downloadInfo,
    isSuccess: isDownloadInfoAvailable,
    isError: isDownloadInfoUnavailable,
    remove: resetDownloadQuery,
  } = useDownload({
    id: typeof submitDownloadData === 'number' ? submitDownloadData : -1,
    facilityName,
    downloadApiUrl,
    enabled:
      typeof submitDownloadData === 'number' && isDownloadSubmittedSuccessfully,
  });

  /**
   * Maps download types to their corresponding info object
   */
  const downloadTypeInfoMap = React.useMemo(
    () =>
      hasFinishedLoadingDownloadTypeStatuses
        ? downloadTypeStatusQueries.reduce((m, { data }) => {
            if (data && data.disabled !== undefined) {
              m.set(data.type, data);
            }
            return m;
          }, new Map<string, DownloadTypeInfo>())
        : null,
    [hasFinishedLoadingDownloadTypeStatuses, downloadTypeStatusQueries]
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
      resetDownloadQuery();
      resetSubmitDownloadMutation();
      setDownloadName('');
      setEmailAddress('');
    }
  }, [props.open, resetDownloadQuery, resetSubmitDownloadMutation]);

  React.useEffect(() => {
    if (props.open) {
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
  }, [isTwoLevel, props.open, totalSize]);

  // call post download success function when download completed successfully
  // allows for e.g. immediately triggering downloading the download if it's available
  React.useEffect(() => {
    if (isDownloadInfoAvailable && postDownloadSuccessFn) {
      postDownloadSuccessFn(downloadInfo);
    }
  }, [downloadInfo, isDownloadInfoAvailable, postDownloadSuccessFn]);

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
    if (!downloadName) {
      setDownloadName(
        getDefaultFileName(t, {
          facilityName,
          ...(visitId && { visitId }),
        })
      );
    }

    // need to typecast here to avoid the non-overlapping options parameter type that we don't use
    (
      submitDownload as UseMutateFunction<
        unknown,
        unknown,
        SubmitCartParams | QueueVisitParams
      >
    )({
      emailAddress,
      fileName: downloadName ?? undefined,
      transport: selectedMethod,
      visitId,
    });
  };

  // check if every query for download type status failed
  const methodsUnavailable = downloadTypeStatusQueries.every(
    ({ isLoading, isError }) => !isLoading && isError
  );

  const shouldShowConfirmationForm =
    props.open &&
    hasFinishedLoadingDownloadTypeStatuses &&
    Boolean(sortedDownloadTypes);

  // whether the download request has failed
  const hasDownloadFailed =
    hasSubmitDownloadFailed || isDownloadInfoUnavailable;

  // whether the download request is successful
  const isDownloadSuccess =
    isDownloadSubmittedSuccessfully &&
    (Array.isArray(submitDownloadData)
      ? submitDownloadData.length > 0 // for queue visit requests
      : isDownloadInfoAvailable); // for submit cart requests

  // whether to show result of submit cart (i.e. successful or failed)
  const shouldShowSubmitCartResult = isDownloadSuccess || hasDownloadFailed;

  return (
    <Dialog
      onClose={dialogClose}
      open={props.open}
      fullWidth={true}
      maxWidth={'sm'}
      aria-label={t('downloadConfirmDialog.dialog_arialabel')}
    >
      {shouldShowSubmitCartResult ? (
        <DownloadRequestResult
          success={isDownloadSuccess}
          closeDialog={setClose}
          redirectToStatusTab={redirectToStatusTab}
          requestInfo={
            isDownloadSuccess
              ? {
                  downloadName,
                  emailAddress,
                  transport: selectedMethod,
                }
              : null
          }
        />
      ) : shouldShowConfirmationForm ? (
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
                  placeholder={`${getDefaultFileName(t, {
                    facilityName,
                    ...(visitId && { visitId }),
                  })}`}
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
                          const methodName =
                            methodInfo?.displayName || type.toUpperCase();
                          return (
                            <option
                              key={index}
                              id={`confirm-access-method-${type}`}
                              aria-label={methodName}
                              value={type}
                              disabled={methodInfo.disabled === undefined}
                            >
                              {methodName}
                            </option>
                          );
                        }
                      )}
                  </Select>

                  <FormHelperText id="confirm-access-method-help">
                    {(() => {
                      const method = downloadTypeInfoMap?.get(selectedMethod);
                      if (methodsUnavailable)
                        return t(
                          'downloadConfirmDialog.access_method_helpertext_all_disabled_error'
                        );
                      if (!method) {
                        return t(
                          'downloadConfirmDialog.access_method_helpertext'
                        );
                      }
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
                {Object.entries(accessMethods)
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
                !(downloadTypeInfoMap?.has(selectedMethod) ?? false) ||
                (downloadTypeInfoMap?.get(selectedMethod)?.disabled ?? true) ||
                methodsUnavailable ||
                isSubmittingDownload
              }
              onClick={processDownload}
              color="primary"
              variant="contained"
            >
              {isSubmittingDownload
                ? t('downloadConfirmDialog.submitting_cart')
                : t('downloadConfirmDialog.download')}
            </Button>
          </DialogActions>
        </div>
      ) : (
        <DialogContent>
          <div style={{ textAlign: 'center', padding: '25px' }}>
            <CircularProgress />
            <Typography style={{ paddingTop: '10px' }}>
              {t('downloadConfirmDialog.loading_confirmation')}
            </Typography>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default DownloadConfirmDialog;
