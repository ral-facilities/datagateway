import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@material-ui/core';

export function formatBytes(bytes: number | undefined): string {
  if (bytes === 0) return '0 B';
  if (!bytes || bytes < 0) return 'Unknown';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

export function datasetLink(
  investigationId: string,
  datasetId: number,
  datasetName: string
): React.ReactElement {
  return (
    <Link
      component={RouterLink}
      to={`/browse/investigation/${investigationId}/dataset/${datasetId}/datafile`}
    >
      {datasetName}
    </Link>
  );
}

export function investigationLink(
  investigationId: number,
  investigationTitle: string
): React.ReactElement {
  return (
    <Link
      component={RouterLink}
      to={`/browse/investigation/${investigationId}/dataset`}
    >
      {investigationTitle}
    </Link>
  );
}

export function tableLink(
  linkUrl: string,
  linkText: string
): React.ReactElement {
  return (
    <Link component={RouterLink} to={linkUrl}>
      {linkText}
    </Link>
  );
}
