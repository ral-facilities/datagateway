import React from 'react';
import { createShallow } from '@mui/material/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { Link } from '@mui/material';
import {
  formatBytes,
  datasetLink,
  investigationLink,
  tableLink,
  formatCountOrSize,
  getStudyInfoInvestigation,
} from './cellContentRenderers';

describe('Cell content renderers', () => {
  let shallow;

  beforeEach(() => {
    shallow = createShallow({});
  });

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
