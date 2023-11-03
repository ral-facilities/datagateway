import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import {
  datasetLink,
  formatBytes,
  formatCountOrSize,
  investigationLink,
  tableLink,
} from './cellContentRenderers';
import { render, screen } from '@testing-library/react';

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

  describe('datasetLink', () => {
    it('renders correctly', () => {
      render(
        <MemoryRouter>{datasetLink('1', 2, 'test', 'card')}</MemoryRouter>
      );
      expect(screen.getByRole('link', { name: 'test' })).toHaveAttribute(
        'href',
        '/browse/investigation/1/dataset/2/datafile?view=card'
      );
    });
  });

  describe('investigationLink', () => {
    it('renders correctly', () => {
      render(
        <MemoryRouter>{investigationLink(1, 'test', 'card')}</MemoryRouter>
      );
      expect(screen.getByRole('link', { name: 'test' })).toHaveAttribute(
        'href',
        '/browse/investigation/1/dataset?view=card'
      );
    });
  });

  describe('tableLink', () => {
    it('renders correctly', () => {
      render(
        <MemoryRouter>{tableLink('/test/url', 'test text')}</MemoryRouter>
      );
      expect(screen.getByRole('link', { name: 'test text' })).toHaveAttribute(
        'href',
        '/test/url'
      );
    });
  });
});
