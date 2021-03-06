import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { Link } from '@material-ui/core';
import {
  formatBytes,
  datasetLink,
  investigationLink,
  tableLink,
} from './cellContentRenderers';

describe('Cell content renderers', () => {
  let shallow;

  beforeEach(() => {
    shallow = createShallow({});
  });

  describe('formatBytes', () => {
    it('converts to bytes correctly', () => {
      expect(formatBytes(10000)).toEqual('9.77 KB');
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
