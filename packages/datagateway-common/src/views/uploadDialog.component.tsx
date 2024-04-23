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

import Uppy, { UppyFile } from '@uppy/core';
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

export const checkNameExists = async (
  apiUrl: string,
  name: string,
  entityType: 'datafile' | 'dataset',
  entityId: number
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
      [`${entityType === 'datafile' ? 'dataset' : 'investigation'}.id`]: {
        eq: entityId,
      },
    })
  );

  try {
    await axios.get(`${apiUrl}/${entityType}s/findone`, {
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

export const beforeFileAdded = (uppy: Uppy, currentFile: UppyFile): boolean => {
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

  const isDuplicate = uppy.getFiles().some((file) => {
    // have to use any here as isGhost is not in the Uppy file type (?)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return file.name === currentFile.name && !(file as any).isGhost;
  });

  if (isDuplicate) {
    uppy.info(
      `File named "${currentFile.name}" is already in the upload queue`,
      'error',
      5000
    );
    return false;
  }

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
  const [textInputDisabled, setTextInputDisabled] =
    React.useState<boolean>(false);

  const datasetId = React.useRef<number | null>(null);

  const [uploadName, setUploadName] = React.useState<string>('');
  const [uploadDescription, setUploadDescription] = React.useState<string>('');

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
      // TODO: ask Alex/users about ux of this
      allowMultipleUploadBatches: false,
      onBeforeFileAdded: (currentFile) => {
        const addFile = beforeFileAdded(uppy, currentFile);
        return addFile;
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
          const fileExists = await checkNameExists(
            apiUrl,
            file.name,
            'datafile',
            entityId
          ).catch((error) => {
            uppy.info(error.message, 'error', 5000);
            return true;
          });

          if (fileExists) {
            uppy.info(
              `File "${file.name}" already exists in this dataset`,
              'error',
              5000
            );
            uppy.removeFile(file.id);
          }
        }

        // add last modified date to file meta
        const lastModified = (file.data as File).lastModified;
        file.meta['lastModified'] = lastModified;
        setUploadDisabled(false);
      })
      .on('error', (error) => {
        uppy.info(error.message, 'error', 5000);
      })
      // // TODO: is this needed here?
      // .on('complete', (result) => {
      //   if (result.failed.length === 0) {
      //     datasetId.current = null;
      //   }
      // })
      .use(Tus, {
        endpoint: `${uploadUrl}/upload/`,
        uploadDataDuringCreation: true,
        headers: {
          authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
  );

  React.useEffect(() => {
    const postProcessor = async (): Promise<void> => {
      // check if the files have been uploaded
      const files = uppy.getFiles();
      const uploadedFiles = files.filter(
        (file) => file?.response !== undefined
      );
      if (uploadedFiles.length > 0) {
        let params = {};
        if (entityType === 'investigation' && datasetId.current === null) {
          params = {
            dataset: {
              datasetName: uploadName,
              datasetDescription: uploadDescription,
              investigationId: entityId,
            },
            datafiles: uploadedFiles.map((file) => {
              return {
                name: file.name,
                url: file.response?.uploadURL,
                size: file.size,
                lastModified: file.meta['lastModified'],
              };
            }),
          };
        } else {
          params = {
            datafiles: uploadedFiles.map((file) => {
              return {
                name: file.name,
                url: file.response?.uploadURL,
                size: file.size,
                datasetId: datasetId.current ? datasetId.current : entityId,
                lastModified: file.meta['lastModified'],
              };
            }),
          };
        }
        return axios
          .post(`${uploadUrl}/commit`, params, {
            headers: {
              authorization: `Bearer ${readSciGatewayToken().sessionId}`,
            },
          })
          .then((response) => {
            datasetId.current = response.data.datasetId ?? null;
            if (entityType === 'datafile') {
              queryClient.invalidateQueries(['datafile']);
            } else {
              queryClient.invalidateQueries(['dataset']);
            }
          });
      }

      return Promise.resolve();
    };

    uppy.addPostProcessor(postProcessor);

    return () => {
      uppy.removePostProcessor(postProcessor);
    };
  }, [
    entityId,
    entityType,
    queryClient,
    uploadDescription,
    uploadName,
    uploadUrl,
    uppy,
  ]);

  // TODO: investigate why this causes tests to fail
  // Temporary fix (?): only use GoldenRetriever if indexedDB is available
  React.useEffect(() => {
    const preProcessor = async (ids: string[]): Promise<void> => {
      const files = uppy.getFiles();

      files
        .filter((file) => file?.response !== undefined)
        .forEach((file) => {
          uppy.removeFile(file.id);
        });

      return Promise.resolve();
    };

    uppy.addPreProcessor(preProcessor);
    if (window.indexedDB) {
      uppy.use(GoldenRetriever);
    }
  }, [uppy]);

  const [t] = useTranslation();
  const theme = useTheme();

  const dialogClose = (_event?: unknown, reason?: string): void => {
    if (reason !== 'backdropClick') {
      uppy.cancelAll({ reason: 'user' });
      setUploadName('');
      setUploadDescription('');
      setClose();
      datasetId.current = null;
      setTextInputDisabled(false);
      setUploadDisabled(false);
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
                  value={uploadName}
                  onChange={(e) => {
                    setUploadName(e.target.value as string);
                  }}
                  disabled={textInputDisabled}
                  required
                />

                <TextField
                  id="upload-description"
                  label={t('upload.description')}
                  fullWidth={true}
                  inputProps={{ maxLength: 2000 }}
                  variant="outlined"
                  value={uploadDescription}
                  onChange={(e) => {
                    setUploadDescription(e.target.value as string);
                  }}
                  multiline
                  rows={16}
                  disabled={textInputDisabled}
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
              doneButtonHandler={() => {
                dialogClose();
              }}
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
              onClick={async () => {
                // Check if the dataset name already exists in the investigation
                if (
                  entityType === 'investigation' &&
                  datasetId.current === null
                ) {
                  const datasetNameExists = await checkNameExists(
                    apiUrl,
                    uploadName,
                    'dataset',
                    entityId
                  ).catch((error) => {
                    uppy.info(error.message, 'error', 5000);
                    return true;
                  });
                  if (datasetNameExists) {
                    uppy.info(
                      `Dataset "${uploadName}" already exists in this investigation`,
                      'error',
                      5000
                    );
                    return;
                  } else if (uploadName === '') {
                    uppy.info('Dataset name cannot be empty', 'error', 5000);
                    return;
                  }
                }

                setTextInputDisabled(true);
                setUploadDisabled(true);

                // Upload queued files
                uppy.upload().then((result) => {
                  // TODO: for debugging / remove later
                  // The file named "fail" will fail to upload but will be uploaded successfully on retry
                  result.failed.forEach((file) => {
                    if (file.meta.name.startsWith('fail')) {
                      file.meta.name = `not${file.meta.name}`;
                    }
                  });
                });
              }}
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
