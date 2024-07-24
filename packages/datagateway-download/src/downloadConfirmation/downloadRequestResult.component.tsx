import { Button, Grid, Typography } from '@mui/material';
import { Mark } from 'datagateway-common';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import type DownloadRequestInfo from './DownloadRequestInfo';
import DialogContent from './dialogContent.component';
import DialogTitle from './dialogTitle.component';

interface DownloadRequestResultComponentProps {
  /**
   * Whether the download request was successful.
   */
  success: boolean;

  /**
   * Forwarded function for closing the dialog.
   */
  closeDialog: () => void;

  /**
   * Forwarded function for redirecting to the download status tab.
   */
  redirectToStatusTab: () => void;

  /**
   * Metadata of the download request. null if the request has failed.
   */
  requestInfo: DownloadRequestInfo | null;
}

/**
 * Grid to show submitted download information
 * @param info Info of the submitted download request.
 * @constructor
 */
function DownloadRequestInfoGrid({
  info,
}: {
  info: DownloadRequestInfo;
}): JSX.Element {
  const [t] = useTranslation();
  return (
    <Grid item xs>
      <div style={{ textAlign: 'center', margin: '0 auto' }}>
        <div style={{ float: 'left', textAlign: 'right' }}>
          <Typography>
            <b>{t('downloadConfirmDialog.confirmation_download_name')}: </b>
          </Typography>
          <Typography>
            <b>{t('downloadConfirmDialog.confirmation_access_method')}: </b>
          </Typography>
          {info.emailAddress && (
            <Typography>
              <b>{t('downloadConfirmDialog.confirmation_email')}: </b>
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
            {info.downloadName}
          </Typography>
          <Typography id="confirm-success-access-method">
            {info.transport.toUpperCase()}
          </Typography>
          {info.emailAddress && (
            <Typography id="confirm-success-email-address">
              {info.emailAddress}
            </Typography>
          )}
        </div>
      </div>
    </Grid>
  );
}

/**
 * A React component that shows the result of a download request.
 * @param success Whether the download request was successful.
 * @param requestInfo Metadata of the download request. null if the request has failed.
 * @param closeDialog Forwarded function for closing the dialog.
 * @param redirectToStatusTab Forwarded function for redirecting to the download status tab.
 * @constructor
 */
function DownloadRequestResult({
  success,
  requestInfo,
  closeDialog,
  redirectToStatusTab,
}: DownloadRequestResultComponentProps): JSX.Element {
  const [t] = useTranslation();

  return (
    <div>
      <DialogTitle id="download-confirm-dialog-title" onClose={closeDialog} />

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
            {success ? (
              <Mark size={100} visible colour="#3e863e" />
            ) : (
              <Mark visible isCross size={100} colour="#a91b2e" />
            )}
          </Grid>

          {success ? (
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

          {success && requestInfo && (
            <DownloadRequestInfoGrid info={requestInfo} />
          )}

          {success && (
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
  );
}

export default DownloadRequestResult;
