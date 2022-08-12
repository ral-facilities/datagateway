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
        <FieldRow name={t('datafiles.details.name')} value={datafile.name} />
        <FieldRow
          name={t('datafiles.details.description')}
          value={datafile.description || t('datafiles.details.unknown')}
        />
        <FieldRow
          name={t('datafiles.details.size')}
          value={
            fileSize ? formatBytes(fileSize) : t('datafiles.details.unknown')
          }
        />
        <FieldRow
          name={t('datafiles.details.location')}
          value={datafile.location || t('datafiles.details.unknown')}
        />
        <FieldRow
          name={t('datafiles.details.mod_time')}
          value={datafile.modTime || t('datafiles.details.unknown')}
        />
        <FieldRow
          name={t('datafiles.details.create_time')}
          value={datafile.createTime || t('datafiles.details.unknown')}
        />
      </Stack>
    </Paper>
  );
}

interface FieldRowProps {
  name: string;
  value: string;
}

function FieldRow({ name, value }: FieldRowProps): JSX.Element {
  return (
    <Stack>
      <b>{name}</b>
      <Typography noWrap={false}>{value}</Typography>
    </Stack>
  );
}

export default DetailsPane;
