import {
  Button,
  CircularProgress,
  Dialog,
  Grid,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import { Mark } from 'datagateway-common';
import React from 'react';
import { QueryStatus } from 'react-query';
import { Link } from 'react-router-dom';

import type { DoiResult } from '../downloadApi';
import DialogContent from '../downloadConfirmation/dialogContent.component';
import DialogTitle from '../downloadConfirmation/dialogTitle.component';

interface DOIConfirmDialogProps {
  open: boolean;
  mintingStatus: QueryStatus;
  data: DoiResult | undefined;
  error: AxiosError<{
    detail: { msg: string }[] | string;
  }> | null;

  setClose: () => void;
}

const DOIConfirmDialog: React.FC<DOIConfirmDialogProps> = (
  props: DOIConfirmDialogProps
) => {
  const { open, mintingStatus, data, error, setClose } = props;

  const isMintError = mintingStatus === 'error';

  const isMintSuccess = mintingStatus === 'success';

  const isMintLoading = mintingStatus === 'loading';

  return (
    <Dialog
      onClose={(event) => {
        if (isMintError) {
          setClose();
        }
      }}
      open={open}
      fullWidth={true}
      maxWidth={'sm'}
    >
      <div>
        <DialogTitle onClose={isMintError ? () => setClose() : undefined}>
          Mint confirmation
        </DialogTitle>
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
              {isMintSuccess ? (
                <Mark size={100} visible colour="#3e863e" />
              ) : isMintError ? (
                <Mark visible isCross size={100} colour="#a91b2e" />
              ) : isMintLoading ? (
                <CircularProgress size={100} />
              ) : null}
            </Grid>

            {isMintSuccess ? (
              <Grid item xs style={{ textAlign: 'center' }}>
                <Typography>Mint was successful</Typography>
              </Grid>
            ) : isMintError ? (
              <Grid item xs style={{ textAlign: 'center' }}>
                <Typography>Mint was unsuccessful</Typography>
              </Grid>
            ) : (
              <Grid item xs style={{ textAlign: 'center' }}>
                <Typography>Loading...</Typography>
              </Grid>
            )}

            {isMintSuccess && data && (
              <Grid item xs>
                <Typography>DOI: {data.doi}</Typography>
              </Grid>
            )}

            {isMintError && error && (
              <Grid item xs>
                <Typography>
                  Error:{' '}
                  {error.response?.data?.detail
                    ? typeof error.response.data.detail === 'string'
                      ? error.response.data.detail
                      : error.response.data.detail[0].msg
                    : error.message}
                </Typography>
              </Grid>
            )}

            {isMintSuccess && data && (
              <Grid item xs>
                <Button
                  component={Link}
                  to={`/browse/dataPublication/${data.data_publication}`}
                  variant="contained"
                  color="primary"
                >
                  View Data Publication
                </Button>
              </Grid>
            )}
          </Grid>
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default DOIConfirmDialog;
