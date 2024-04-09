import React from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent as MuiDialogContent,
  Grid,
  styled,
  TextField,
  Typography,
  Box,
  useTheme,
} from '@mui/material';

import Uppy from '@uppy/core';
import { Dashboard } from '@uppy/react';
import Tus from '@uppy/tus';
import GoldenRetriever from '@uppy/golden-retriever';
import '@uppy/core/dist/style.min.css';
import '@uppy/drag-drop/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';

import { readSciGatewayToken } from '../parseTokens';
import { refreshSession } from '../api';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { StateType } from '../state/app.types';
import axios from 'axios';

const DialogContent = styled(MuiDialogContent)(({ theme }) => ({
  padding: theme.spacing(2),
}));

export const checkDatafileName = async (
  apiUrl: string,
  name: string,
  datasetId: number
): Promise<boolean> => {
  const params = new URLSearchParams();
  params.append(
    'where',
    JSON.stringify({
      name: { eq: name },
    })
  );
  params.append(
    'where',
    JSON.stringify({
      'dataset.id': { eq: datasetId },
    })
  );

  try {
    await axios.get(`${apiUrl}/datafiles/findone`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    });
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return false;
    }
    throw error;
  }
};

const parseUploadUrl = (url: string): string => {
  const uuid = url.split('/').pop();
  return (
    uuid?.slice(0, 8) +
    '-' +
    uuid?.slice(8, 12) +
    '-' +
    uuid?.slice(12, 16) +
    '-' +
    uuid?.slice(16, 20) +
    '-' +
    uuid?.slice(20)
  );
};

interface UploadDialogProps {
  entityType: 'investigation' | 'dataset' | 'datafile';
  entityId: number;
  open: boolean;

  setClose: () => void;
}

const UploadDialog: React.FC<UploadDialogProps> = (
  props: UploadDialogProps
) => {
  const { entityType, entityId, open, setClose } = props;
  const queryClient = useQueryClient();
  const uploadUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.uploadUrl
  );
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const [uploadDisabled, setUploadDisabled] = React.useState<boolean>(false);

  const [uppy] = React.useState(() =>
    new Uppy({
      // debug: true,
      id:
        `${
          entityType === 'investigation' ? 'investigation' : 'dataset'
        }-${props.entityId?.toString()}` ?? 'null',
      autoProceed: false,
      restrictions: {
        maxTotalFileSize: 5368709120,
      },
      onBeforeFileAdded: (currentFile) => {
        const isCorrectExtension = [
          '.xml',
          '.exe',
          '.dll',
          '.bat',
          '.sh',
          '.sqlite',
          '.js',
          '.vbs',
          '.PHP',
          '.wmv',
          '.mp3',
          '.flv',
        ].some((ext) => currentFile.name.endsWith(ext));

        if (isCorrectExtension) {
          uppy.info(
            `.${currentFile.name
              .split('.')
              .pop()
              ?.toLowerCase()} files are not allowed`,
            'error',
            5000
          );
          return false;
        } else {
          // TODO: is there another way to do this?
          // Workaround for Uppy bug where it doubles the size of restored files
          uppy.getFiles().forEach((file) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (file.id === currentFile.id && (file as any).isGhost) {
              file.size = 0;
            }
          });
          return true;
        }
      },
      onBeforeUpload: (files) => {
        // Refresh the session before uploading so that the session doesn't expire
        // while the user is idly uploading large files
        refreshSession(apiUrl);
        return true;
      },
    })
      .on('file-added', async (file) => {
        setUploadDisabled(true);
        if (entityType !== 'investigation') {
          const fileExists = await checkDatafileName(
            apiUrl,
            file.name,
            entityId
          ).catch((error) => {
            uppy.info(error.message, 'error', 5000);
            return true;
          });

          if (fileExists) {
            uppy.info(
              `File ${file.name} already exists in this dataset`,
              'error',
              5000
            );
            uppy.removeFile(file.id);
          }
        }
        setUploadDisabled(false);
      })
      .on('error', (error) => {
        uppy.info(error.message, 'error', 5000);
      })
      .use(Tus, {
        endpoint: `${uploadUrl}/upload/`,
        uploadDataDuringCreation: true,
        headers: {
          authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
  );

  // TODO: investigate why this causes tests to fail
  // Temporary fix (?): only use GoldenRetriever if indexedDB is available
  React.useEffect(() => {
    if (window.indexedDB) {
      uppy.use(GoldenRetriever);
    }
  }, [uppy]);

  const [t] = useTranslation();
  const theme = useTheme();

  const [uploadName, setUploadName] = React.useState<string>('');
  const [uploadDescription, setUploadDescription] = React.useState<string>('');

  const dialogClose = (_event?: unknown, reason?: string): void => {
    if (reason !== 'backdropClick') {
      uppy.cancelAll({ reason: 'user' });
      setClose();
    }
  };

  return (
    <Dialog open={open} fullWidth={true} maxWidth={'md'} onClose={dialogClose}>
      <DialogTitle
        id="download-confirm-dialog-title"
        sx={{ margin: 0, padding: 2 }}
      >
        <Typography sx={{ fontSize: '1.25rem' }}>
          {entityType === 'investigation'
            ? t('buttons.upload_dataset')
            : t('buttons.upload_datafile')}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} paddingTop={1}>
          {entityType === 'investigation' && (
            <Grid item xs={4}>
              <Box
                display="flex"
                flexDirection="column"
                height="100%"
                justifyContent="space-between"
              >
                <TextField
                  id="upload-name"
                  label={t('upload.name')}
                  fullWidth={true}
                  inputProps={{ maxLength: 255 }}
                  variant="outlined"
                  onChange={(e) => {
                    setUploadName(e.target.value as string);
                  }}
                  required
                />

                <TextField
                  id="upload-description"
                  label={t('upload.description')}
                  fullWidth={true}
                  inputProps={{ maxLength: 2000 }}
                  variant="outlined"
                  onChange={(e) => {
                    setUploadDescription(e.target.value as string);
                  }}
                  multiline
                  rows={16}
                />
              </Box>
            </Grid>
          )}
          <Grid item xs={entityType !== 'investigation' ? 12 : 8}>
            <Dashboard
              uppy={uppy}
              proudlyDisplayPoweredByUppy={false}
              note="Total file size 5GB or less"
              showProgressDetails={true}
              hideUploadButton={true}
              fileManagerSelectionType="both"
              hideProgressAfterFinish={false}
              height="30em"
              width="100%"
              theme={theme.palette.mode}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <Grid container spacing={2} paddingLeft={1}>
        <Grid item xs>
          <DialogActions sx={{ margin: 0, paddingTop: 0 }}>
            <Button
              onClick={dialogClose}
              variant="text"
              aria-label="cancel"
              sx={{ color: theme.palette.text.primary }}
            >
              Cancel
            </Button>
            <Button
              onClick={setClose}
              variant="text"
              aria-label="close"
              sx={{ color: theme.palette.text.primary }}
            >
              Close
            </Button>
            <Button
              onClick={() =>
                uppy.upload().then((result) => {
                  console.log(result);
                  let params = {};
                  if (entityType === 'investigation') {
                    params = {
                      dataset: {
                        datasetName: uploadName,
                        datasetDescription: uploadDescription,
                        investigationId: entityId,
                      },
                      datafiles: result.successful.map((file) => {
                        const uuid = parseUploadUrl(file.uploadURL);
                        return {
                          name: file.name,
                          id: uuid,
                          size: file.size,
                        };
                      }),
                    };
                  } else {
                    params = {
                      datafiles: result.successful.map((file) => {
                        const uuid = parseUploadUrl(file.uploadURL);
                        return {
                          name: file.name,
                          id: uuid,
                          size: file.size,
                          datasetId: entityId,
                        };
                      }),
                    };
                  }
                  axios
                    .post(`${uploadUrl}/commit`, params, {
                      headers: {
                        authorization: `Bearer ${
                          readSciGatewayToken().sessionId
                        }`,
                      },
                    })
                    .catch((error) => {
                      uppy.info(error.message, 'error', 5000);
                    });

                  if (entityType === 'datafile') {
                    queryClient.invalidateQueries(['datafile']);
                  } else {
                    queryClient.invalidateQueries(['dataset']);
                  }
                })
              }
              variant="contained"
              aria-label="upload"
              disabled={uploadDisabled}
            >
              Upload
            </Button>
          </DialogActions>
        </Grid>
      </Grid>
    </Dialog>
  );
};

export default UploadDialog;
