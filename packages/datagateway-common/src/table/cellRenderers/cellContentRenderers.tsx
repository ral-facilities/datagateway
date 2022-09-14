import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';
import type {
  DateFilter,
  FiltersType,
  Investigation,
  Study,
  StudyInvestigation,
  TextFilter,
  ViewsType,
} from '../../app.types';
import { UseQueryResult } from 'react-query';
import { isWithinInterval } from 'date-fns';

export function formatBytes(bytes: number | undefined): string {
  if (bytes === -1) return 'Loading...';
  if (bytes === 0) return '0 B';
  if (!bytes || bytes < 0) return 'Unknown';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(1000));

  return parseFloat((bytes / Math.pow(1000, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * A helper function to format the result of count and size queries
 *
 * @param query The count or size query to extract data from
 * @param formatAsBytes Whether to format the data as bytes, default is false
 * @returns a string with either Calculating, Unknown or the formatted data
 */
export function formatCountOrSize(
  query: UseQueryResult<number, Error>,
  formatAsBytes = false
): string {
  if (query?.isFetching) return 'Calculating...';
  if (query?.isSuccess) {
    if (formatAsBytes) return formatBytes(query.data);
    return query.data.toString();
  }
  return 'Unknown';
}

export const getStudyInfoInvestigation = (
  study: Study
): Investigation | undefined => {
  return study.studyInvestigations?.filter((si) => si?.investigation)?.[0]
    ?.investigation;
};

/**
 * Given a Study object and a list of query param filters, return a list of {@link StudyInvestigation}
 * that passes the filters.
 *
 * @param study   The Study object that the returned list of StudyInvestigations belong to.
 * @param filters The query param filters that should be applied to the filter operation.
 *
 * @return A list of {@link StudyInvestigation} belonging to the given {@link Study} object
 *         that passes the given list of filters, or `undefined` if the {@link Study} object
 *         doesn't have any {@link StudyInvestigation}s.
 */
export const filterStudyInfoInvestigations = (
  study: Study,
  filters: FiltersType
): StudyInvestigation[] | undefined => {
  const titleFilter = filters[
    'studyInvestigations.investigation.title'
  ] as TextFilter;
  const startDateFilter = filters[
    'studyInvestigations.investigation.startDate'
  ] as DateFilter;
  const endDateFilter = filters[
    'studyInvestigations.investigation.endDate'
  ] as DateFilter;

  // a list of filters that a StudyInvestigation needs to pass
  // in order to make it to the final list.
  // Each function returns true or false indicating whether the given StudyInvestigation passes the filter.
  const filterFns: ((s: StudyInvestigation) => boolean)[] = [];

  if (titleFilter && titleFilter.value) {
    // check if the underlying Investigation has a matching title
    filterFns.push(
      (studyInvestigation) =>
        studyInvestigation?.investigation?.title?.includes(
          String(titleFilter.value)
        ) === true
    );
  }
  if (startDateFilter) {
    // check if the start date of the underlying Investigation falls
    // within the range specified by the start date filter.

    // if the start of the filter range is not specified, defaults to the beginning of time
    // which is January 1st, 1970
    const filterStart = new Date(startDateFilter.startDate ?? 0);
    // if the end of the filter range is not specified, defaults to the end of the universe
    // which is Sep 13, 275760
    const filterEnd = new Date(startDateFilter.endDate ?? 8640000000000000);
    filterFns.push((studyInvestigation) => {
      const startDate = studyInvestigation?.investigation?.startDate;
      if (!startDate) return false;
      return isWithinInterval(new Date(startDate), {
        start: filterStart,
        end: filterEnd,
      });
    });
  }
  if (endDateFilter) {
    // check if the e end date of the underlying Investigation falls
    // within the range specified by the end date filter.

    // if the start of the filter range is not specified, defaults to the beginning of time
    // which is January 1st, 1970
    const filterStart = new Date(endDateFilter.startDate ?? 0);
    // if the end of the filter range is not specified, defaults to the end of the universe
    // which is Sep 13, 275760
    const filterEnd = new Date(endDateFilter.endDate ?? 8640000000000000);
    filterFns.push((studyInvestigation) => {
      const endDate = studyInvestigation?.investigation?.endDate;
      if (!endDate) return false;
      return isWithinInterval(new Date(endDate), {
        start: filterStart,
        end: filterEnd,
      });
    });
  }

  // return only the StudyInvestigations that passes every filter specified.
  return study.studyInvestigations?.filter((s) => filterFns.every((f) => f(s)));
};

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
