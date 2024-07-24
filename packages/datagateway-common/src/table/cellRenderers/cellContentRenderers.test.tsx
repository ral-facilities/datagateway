import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import {
  datasetLink,
  formatBytes,
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
