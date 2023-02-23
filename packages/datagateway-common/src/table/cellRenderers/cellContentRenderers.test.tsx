import React from 'react';
import { shallow } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { Link } from '@mui/material';
import {
  formatBytes,
  datasetLink,
  investigationLink,
  tableLink,
  formatCountOrSize,
  getStudyInfoInvestigation,
  filterStudyInfoInvestigations,
} from './cellContentRenderers';
import type {
  DateFilter,
  FiltersType,
  Study,
  TextFilter,
} from '../../app.types';

describe('Cell content renderers', () => {
  describe('formatBytes', () => {
    it('converts to bytes correctly', () => {
      expect(formatBytes(10000)).toEqual('10 KB');
    });

    it('handles 0 correctly', () => {
      expect(formatBytes(0)).toEqual('0 B');
    });

    it('handles -1 correctly', () => {
      expect(formatBytes(-1)).toEqual('Loading...');
    });

    it('handles negative numbers correctly', () => {
      expect(formatBytes(-7)).toEqual('Unknown');
    });

    it('handles undefined correctly', () => {
      expect(formatBytes(undefined)).toEqual('Unknown');
    });
  });

  describe('formatCountOrSize', () => {
    it('Returns calculating if query is fetching', () => {
      expect(formatCountOrSize({ isFetching: true })).toEqual('Calculating...');
    });

    it('Returns unknown if query result is undefined', () => {
      expect(formatCountOrSize({ isFetching: false, data: undefined })).toEqual(
        'Unknown'
      );
      expect(formatCountOrSize({ isFetching: false })).toEqual('Unknown');
      expect(formatCountOrSize({})).toEqual('Unknown');
      expect(formatCountOrSize(undefined)).toEqual('Unknown');
    });

    it('Returns data if query is successful', () => {
      expect(
        formatCountOrSize({ isFetching: false, isSuccess: true, data: 1 })
      ).toEqual('1');
      expect(formatCountOrSize({ data: 1, isSuccess: true })).toEqual('1');
    });

    it('Returns data formatted in bytes when byte flag is set', () => {
      expect(
        formatCountOrSize({ isFetching: false, isSuccess: true, data: 1 }, true)
      ).toEqual('1 B');
      expect(formatCountOrSize({ data: 10000, isSuccess: true }, true)).toEqual(
        '10 KB'
      );
    });

    it('Returns data if query is successful and result is zero', () => {
      expect(
        formatCountOrSize({ isFetching: false, isSuccess: true, data: 0 })
      ).toEqual('0');
    });
  });

  describe('getStudyInfoInvestigation', () => {
    it('filters out missing investigations and returns first existing investigation', () => {
      expect(
        getStudyInfoInvestigation({
          id: 1,
          pid: 'doi 1',
          name: 'study 1',
          modTime: '',
          createTime: '',
          studyInvestigations: [
            {
              id: 2,
            },
            {
              id: 3,
              investigation: {
                id: 4,
                title: 'Investigating the properties of the number 4',
                name: 'investigation 4',
                visitId: '1',
              },
            },
          ],
        })?.name
      ).toEqual('investigation 4');
    });

    it('handles undefined properties fine', () => {
      expect(
        getStudyInfoInvestigation({
          id: 1,
          pid: 'doi 1',
          name: 'study 1',
          modTime: '',
          createTime: '',
        })
      ).toBeUndefined();
      expect(
        getStudyInfoInvestigation({
          id: 1,
          pid: 'doi 1',
          name: 'study 1',
          modTime: '',
          createTime: '',
          studyInvestigations: [
            {
              id: 2,
            },
            {
              id: 3,
            },
          ],
        })
      ).toBeUndefined();
    });
  });

  describe('filterStudyInfoInvestigations', () => {
    const study: Study = {
      id: 1,
      pid: '3Pd4AO',
      name: 'lip',
      modTime: '1977-01-01',
      createTime: '1977-01-01',
      studyInvestigations: [
        {
          id: 183,
          investigation: {
            id: 2,
            title: 'react js',
            name: 'rod of ages',
            visitId: 'kxinp',
            startDate: '2010-03-01',
            endDate: '2021-01-09',
          },
        },
        {
          id: 248,
          investigation: {
            id: 3,
            title: 'whenever maybe spill second',
            name: 'divine sunderer',
            visitId: 'B8YxAMU',
            startDate: '2010-03-01',
            endDate: '2025-01-09',
          },
        },
        {
          id: 374,
          investigation: {
            id: 3,
            title: 'whenever maybe spill third',
            name: 'boots of lucidity',
            visitId: 'FNv0',
            startDate: '2009-03-01',
            endDate: '2021-12-23',
          },
        },
      ],
    };

    it('should return a list of StudyInvestigations that only matches the given filters', () => {
      const includeTitleFilter: TextFilter = {
        type: 'include',
        value: 'react',
      };
      const excludeTitleFilter: TextFilter = {
        type: 'exclude',
        value: 'react',
      };
      const startDateFilter: DateFilter = {
        startDate: '2010-01-01',
        endDate: '2011-01-01',
      };
      const endDateFilter: DateFilter = {
        startDate: '2020-01-01',
        endDate: '2022-01-01',
      };
      const filters: FiltersType = {
        'studyInvestigations.investigation.title': includeTitleFilter,
        'studyInvestigations.investigation.startDate': startDateFilter,
        'studyInvestigations.investigation.endDate': endDateFilter,
      };

      expect(filterStudyInfoInvestigations(study, filters)).toEqual([
        {
          id: 183,
          investigation: {
            id: 2,
            title: 'react js',
            name: 'rod of ages',
            visitId: 'kxinp',
            startDate: '2010-03-01',
            endDate: '2021-01-09',
          },
        },
      ]);

      // verify that the function works with exclude text filter
      filters['studyInvestigations.investigation.title'] = excludeTitleFilter;
      expect(filterStudyInfoInvestigations(study, filters)).toHaveLength(0);
    });

    it('should return a list of study investigations that match the given start date filter with no start date', () => {
      const startDateFilter: DateFilter = {
        endDate: '2009-04-01',
      };
      const filters: FiltersType = {
        'studyInvestigations.investigation.startDate': startDateFilter,
      };

      expect(filterStudyInfoInvestigations(study, filters)).toEqual([
        {
          id: 374,
          investigation: {
            id: 3,
            title: 'whenever maybe spill third',
            name: 'boots of lucidity',
            visitId: 'FNv0',
            startDate: '2009-03-01',
            endDate: '2021-12-23',
          },
        },
      ]);
    });

    it('should return a list of study investigations that match the given start date filter with no end date', () => {
      const startDateFilter: DateFilter = {
        startDate: '2009-04-01',
      };
      const filters: FiltersType = {
        'studyInvestigations.investigation.startDate': startDateFilter,
      };

      expect(filterStudyInfoInvestigations(study, filters)).toEqual([
        {
          id: 183,
          investigation: {
            id: 2,
            title: 'react js',
            name: 'rod of ages',
            visitId: 'kxinp',
            startDate: '2010-03-01',
            endDate: '2021-01-09',
          },
        },
        {
          id: 248,
          investigation: {
            id: 3,
            title: 'whenever maybe spill second',
            name: 'divine sunderer',
            visitId: 'B8YxAMU',
            startDate: '2010-03-01',
            endDate: '2025-01-09',
          },
        },
      ]);
    });

    it('should return a list of study investigations that match the given end date filter with no start date', () => {
      const endDateFilter: DateFilter = {
        endDate: '2022-03-01',
      };

      const filters: FiltersType = {
        'studyInvestigations.investigation.endDate': endDateFilter,
      };

      expect(filterStudyInfoInvestigations(study, filters)).toEqual([
        {
          id: 183,
          investigation: {
            id: 2,
            title: 'react js',
            name: 'rod of ages',
            visitId: 'kxinp',
            startDate: '2010-03-01',
            endDate: '2021-01-09',
          },
        },
        {
          id: 374,
          investigation: {
            id: 3,
            title: 'whenever maybe spill third',
            name: 'boots of lucidity',
            visitId: 'FNv0',
            startDate: '2009-03-01',
            endDate: '2021-12-23',
          },
        },
      ]);
    });

    it('should return a list of study investigations that match the given end date filter with no end date', () => {
      const endDateFilter: DateFilter = {
        startDate: '2025-01-01',
      };

      const filters: FiltersType = {
        'studyInvestigations.investigation.endDate': endDateFilter,
      };

      expect(filterStudyInfoInvestigations(study, filters)).toEqual([
        {
          id: 248,
          investigation: {
            id: 3,
            title: 'whenever maybe spill second',
            name: 'divine sunderer',
            visitId: 'B8YxAMU',
            startDate: '2010-03-01',
            endDate: '2025-01-09',
          },
        },
      ]);
    });

    it('should return undefined if the given study object does not have study investigations', () => {
      const { studyInvestigations, ...rest } = study;
      expect(filterStudyInfoInvestigations(rest, {})).toBeUndefined();
    });
  });

  describe('datasetLink', () => {
    it('renders correctly', () => {
      const wrapper = shallow(
        <MemoryRouter>{datasetLink('1', 2, 'test', 'card')}</MemoryRouter>
      );
      expect(wrapper.find(Link)).toMatchSnapshot();
    });
  });

  describe('investigationLink', () => {
    it('renders correctly', () => {
      const wrapper = shallow(
        <MemoryRouter>{investigationLink(1, 'test', 'card')}</MemoryRouter>
      );
      expect(wrapper.find(Link)).toMatchSnapshot();
    });
  });

  describe('tableLink', () => {
    it('renders correctly', () => {
      const wrapper = shallow(
        <MemoryRouter>{tableLink('/test/url', 'test text')}</MemoryRouter>
      );
      expect(wrapper.find(Link)).toMatchSnapshot();
    });
  });
});
