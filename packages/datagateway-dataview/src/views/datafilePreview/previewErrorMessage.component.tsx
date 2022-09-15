import { Stack, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface PreviewErrorMessageProps {
  title: string;
  description?: string;
}

function PreviewErrorMessage({
  title,
  description,
}: PreviewErrorMessageProps): JSX.Element {
  const [t] = useTranslation();

  return (
    <Stack alignItems="center">
      <Typography>{title}</Typography>
      <Typography variant="body2">
        {description || t('datafiles.preview.unexpected_error')}
      </Typography>
    </Stack>
  );
}

export default PreviewErrorMessage;
