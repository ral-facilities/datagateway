import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@material-ui/core';
import { ViewsType } from '../../state/app.types';

export function formatBytes(bytes: number | undefined): string {
  if (bytes === -1) return 'Loading...';
  if (bytes === 0) return '0 B';
  if (!bytes || bytes < 0) return 'Unknown';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
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
  view?: ViewsType
): React.ReactElement {
  const link = `/browse/investigation/${investigationId}/dataset`;
  return (
    <Link component={RouterLink} to={appendView(link, view)}>
      {investigationTitle}
    </Link>
  );
}

export function tableLink(
  linkUrl: string,
  linkText: string,
  view?: ViewsType
): React.ReactElement {
  return (
    <Link component={RouterLink} to={appendView(linkUrl, view)}>
      {linkText}
    </Link>
  );
}
