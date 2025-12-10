import PublicIcon from '@mui/icons-material/Public';
import {
  Button,
  CircularProgress,
  Dialog,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOpenDataPublication } from '../api';
import { DataPublication } from '../app.types';
import { StyledTooltip } from '../arrowtooltip.component';
import DialogContent from '../dialogContent.component';
import DialogTitle from '../dialogTitle.component';
import Mark from '../mark.component';

export interface PublishButtonProps {
  dataPublication: DataPublication;
}

const PublishButton: React.FC<PublishButtonProps> = (props) => {
  const { dataPublication } = props;

  const [t] = useTranslation();

  const [open, setOpen] = React.useState(false);
  const [showRequestResult, setShowRequestResult] = React.useState(false);

  const { mutate: publishDataPublication, status } = useOpenDataPublication();

  const isPublishError = status === 'error';

  const isPublishSuccess = status === 'success';

  const isPublishLoading = status === 'loading';

  const queryClient = useQueryClient();

  const close = React.useCallback(() => {
    if (isPublishSuccess) {
      queryClient.invalidateQueries({
        queryKey: ['dataPublication', dataPublication.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['doi', dataPublication.pid],
      });
    }
    setOpen(false);
  }, [dataPublication.id, dataPublication.pid, isPublishSuccess, queryClient]);

  return (
    <>
      <StyledTooltip
        title={t('datapublications.publish.publish_label')}
        placement="bottom"
        arrow
      >
        <IconButton
          sx={{ ml: 'auto' }}
          onClick={() => {
            setOpen(true);
          }}
          aria-label={t('datapublications.publish.publish_label')}
        >
          <PublicIcon />
        </IconButton>
      </StyledTooltip>
      <Dialog onClose={close} open={open} fullWidth={true} maxWidth={'sm'}>
        <div>
          <DialogTitle
            onClose={close}
            closeAriaLabel={t('DOIPublishConfirmDialog.close_aria_label')}
          >
            {t('DOIPublishConfirmDialog.dialog_title')}
          </DialogTitle>
          <DialogContent>
            {!showRequestResult ? (
              <Grid container flexDirection="column">
                <Grid item>
                  {/* TODO: write data policy text */}
                  <Typography variant="body2">
                    {t('DOIPublishConfirmDialog.data_policy')}
                  </Typography>
                </Grid>
                <Grid item alignSelf="end">
                  <Button
                    variant="contained"
                    onClick={() => {
                      publishDataPublication({
                        dataPublicationId: dataPublication.id.toString(),
                      });
                      setShowRequestResult(true);
                    }}
                  >
                    {t('DOIPublishConfirmDialog.accept')}
                  </Button>
                </Grid>
              </Grid>
            ) : (
              <Grid
                container
                spacing={4}
                direction="column"
                alignItems="center"
                justifyContent="center"
                style={{ paddingBottom: '25px' }}
              >
                <Grid item xs>
                  {isPublishSuccess ? (
                    <Mark size={100} visible colour="#3e863e" />
                  ) : isPublishError ? (
                    <Mark visible isCross size={100} colour="#a91b2e" />
                  ) : isPublishLoading ? (
                    <CircularProgress size={100} color="secondary" />
                  ) : null}
                </Grid>

                {isPublishSuccess ? (
                  <Grid item xs style={{ textAlign: 'center' }}>
                    <Typography>
                      {t('DOIPublishConfirmDialog.publish_success')}
                    </Typography>
                  </Grid>
                ) : isPublishError ? (
                  <Grid item xs style={{ textAlign: 'center' }}>
                    <Typography>
                      {t('DOIPublishConfirmDialog.publish_error')}
                    </Typography>
                  </Grid>
                ) : (
                  <Grid item xs style={{ textAlign: 'center' }}>
                    <Typography>
                      {t('DOIPublishConfirmDialog.publish_loading')}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
        </div>
      </Dialog>
    </>
  );
};

export default PublishButton;
