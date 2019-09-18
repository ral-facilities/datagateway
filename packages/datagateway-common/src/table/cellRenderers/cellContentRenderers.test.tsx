import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { Link } from '@material-ui/core';
import {
  formatBytes,
  datasetLink,
  investigationLink,
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
  });

  describe('datasetLink', () => {
    it('renders correctly', () => {
      const wrapper = shallow(
        <MemoryRouter>{datasetLink('1', 2, 'test')}</MemoryRouter>
      );
      expect(wrapper.find(Link)).toMatchSnapshot();
    });
  });

  describe('investigationLink', () => {
    it('renders correctly', () => {
      const wrapper = shallow(
        <MemoryRouter>{investigationLink(1, 'test')}</MemoryRouter>
      );
      expect(wrapper.find(Link)).toMatchSnapshot();
    });
  });
});
