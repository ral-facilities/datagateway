import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';
import type { ViewsType } from '../../app.types';

export function formatBytes(bytes: number | undefined): string {
  if (bytes === -1) return 'Loading...';
  if (bytes === 0) return '0 B';
  if (!bytes || bytes < 0) return 'Unknown';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(1000));

  return parseFloat((bytes / Math.pow(1000, i)).toFixed(2)) + ' ' + sizes[i];
}

// NOTE: Allow the link to specify the view to keep the same view when navigating.
const appendView = (link: string, view?: ViewsType): string =>
  view ? (link += `?view=${view}`) : link;

export function datasetLink(
  investigationId: string,
  datasetId: number,
  datasetName: string,
  view?: ViewsType
): React.ReactElement {
  const link = `/browse/investigation/${investigationId}/dataset/${datasetId}/datafile`;
  return (
    <Link component={RouterLink} to={appendView(link, view)}>
      {datasetName}
    </Link>
  );
}

export function investigationLink(
  investigationId: number,
  investigationTitle: string,
  view?: ViewsType,
  testid?: string
): React.ReactElement {
  const link = `/browse/investigation/${investigationId}/dataset`;
  return (
    <Link
      component={RouterLink}
      to={appendView(link, view)}
      data-testid={testid}
    >
      {investigationTitle}
    </Link>
  );
}

export function tableLink(
  linkUrl: string,
  linkText: string,
  view?: ViewsType,
  testid?: string
): React.ReactElement {
  return (
    <Link
      component={RouterLink}
      to={appendView(linkUrl, view)}
      data-testid={testid}
    >
      {linkText}
    </Link>
  );
}

export function externalSiteLink(
  linkUrl: string,
  linkText?: string,
  testid?: string
): React.ReactElement {
  return (
    <Link href={linkUrl} data-testid={testid}>
      {linkText}
    </Link>
  );
}
