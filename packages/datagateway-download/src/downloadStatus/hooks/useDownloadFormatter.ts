import type {
  Download,
  DownloadStatus,
  FormattedDownload,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * A function that given a {@link Download} object, returns the formatted version
 * with all server side values replaced with user-facing labels.
 */
type DownloadFormatter = (download: Download) => FormattedDownload;

/**
 * A map that maps {@link DownloadStatus} to the corresponding user-facing label.
 */
type DownloadStatusLabelMap = {
  [Status in DownloadStatus]: string;
};

/**
 * A React hook that provides a function for formatting {@link Download} objects,
 * and a map for mapping {@link DownloadStatus} to the corresponding user-facing label.
 */
function useDownloadFormatter(): {
  formatDownload: DownloadFormatter;
  downloadStatusLabels: DownloadStatusLabelMap;
} {
  const [t] = useTranslation();
  const statusLabels: DownloadStatusLabelMap = React.useMemo(
    () => ({
      COMPLETE: t('downloadStatus.complete'),
      EXPIRED: t('downloadStatus.expired'),
      PAUSED: t('downloadStatus.paused'),
      PREPARING: t('downloadStatus.preparing'),
      RESTORING: t('downloadStatus.restoring'),
    }),
    [t]
  );

  const downloadFormatter = React.useCallback(
    (download: Download): FormattedDownload => ({
      ...download,
      formattedIsDeleted: download.isDeleted ? 'Yes' : 'No',
      formattedStatus: statusLabels[download.status] ?? '',
    }),
    [statusLabels]
  );

  return {
    formatDownload: downloadFormatter,
    downloadStatusLabels: statusLabels,
  };
}

export default useDownloadFormatter;
