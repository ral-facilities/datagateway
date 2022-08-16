import { Paper, Stack, Typography } from '@mui/material';
import { formatBytes } from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import DatafilePreviewerContext from './datafilePreviewerContext';

/**
 * A pane in {@link DatafilePreviewer} that displays the metadata of the given {@link Datafile}
 *
 * @see DatafilePreviewer
 * @see PreviewPane
 * @constructor
 */
function DetailsPane(): JSX.Element {
  const [t] = useTranslation();
  const previewerContext = React.useContext(DatafilePreviewerContext);

  // this should only occur when DatafilePreviewerContext is not provided
  if (!previewerContext) return <></>;

  const { datafile } = previewerContext;
  const { fileSize } = datafile;

  return (
    <Paper
      sx={{
        height: 'calc(100vh - 64px - 36px - 48px - 48px)',
        padding: 2,
      }}
    >
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        {t('datafiles.details.label')}
      </Typography>
      <Stack spacing={2}>
        <DetailsField
          name={t('datafiles.details.name')}
          value={datafile.name}
        />
        <DetailsField
          name={t('datafiles.details.description')}
          value={datafile.description || t('datafiles.details.unknown')}
        />
        <DetailsField
          name={t('datafiles.details.size')}
          value={
            fileSize ? formatBytes(fileSize) : t('datafiles.details.unknown')
          }
        />
        <DetailsField
          name={t('datafiles.details.location')}
          value={datafile.location || t('datafiles.details.unknown')}
        />
        <DetailsField
          name={t('datafiles.details.mod_time')}
          value={datafile.modTime || t('datafiles.details.unknown')}
        />
        <DetailsField
          name={t('datafiles.details.create_time')}
          value={datafile.createTime || t('datafiles.details.unknown')}
        />
      </Stack>
    </Paper>
  );
}

/**
 * @see DetailsField
 */
interface FieldRowProps {
  name: string;
  value: string;
}

/**
 * A field in {@link DetailsPane} that displays the name and value of a field
 * in the datafile currently being previewed.
 *
 * @param name The name of the field to be displayed
 * @param value The value of the field to be displayed
 */
function DetailsField({ name, value }: FieldRowProps): JSX.Element {
  return (
    <Stack>
      <b>{name}</b>
      <Typography sx={{ wordWrap: 'break-word' }}>{value}</Typography>
    </Stack>
  );
}

export default DetailsPane;
