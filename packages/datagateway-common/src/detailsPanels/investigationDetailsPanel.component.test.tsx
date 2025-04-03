import * as React from 'react';
import InvestigationDetailsPanel from './investigationDetailsPanel.component';
import { Investigation, type SearchResultSource } from '../app.types';
import { render, screen } from '@testing-library/react';

describe('Investigation details panel component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows investigation details correctly', () => {
    const rowData: Investigation = {
      id: 1,
      title: 'Test title 1',
      name: 'Test 1',
      summary: 'foo bar',
      visitId: '1',
      doi: 'doi 1',
      fileSize: 1,
      investigationInstruments: [
        {
          id: 1,
          instrument: {
            id: 3,
            name: 'LARMOR',
          },
        },
      ],
      startDate: '2019-06-10',
      endDate: '2019-06-11',
    };

    render(<InvestigationDetailsPanel rowData={rowData} />);

    expect(screen.getByText('Test title 1')).toBeInTheDocument();
    expect(screen.getByText('Test 1')).toBeInTheDocument();
    expect(screen.getByText('2019-06-10')).toBeInTheDocument();
    expect(screen.getByText('2019-06-11')).toBeInTheDocument();
  });

  it('shows investigation details of search result source correctly', () => {
    const rowData: SearchResultSource = {
      id: 1,
      title: 'Test title 1',
      name: 'Test 1',
      summary: 'foo bar',
      visitId: '1',
      doi: 'doi 1',
      startDate: 1563940800000,
      endDate: 1564027200000,
    };

    render(<InvestigationDetailsPanel rowData={rowData} />);

    expect(screen.getByText('Test title 1')).toBeInTheDocument();
    expect(screen.getByText('Test 1')).toBeInTheDocument();
    expect(screen.getByText('24/07/2019')).toBeInTheDocument();
    expect(screen.getByText('25/07/2019')).toBeInTheDocument();
  });

  it('shows start/end date as unknown if not provided', () => {
    const rowData: SearchResultSource = {
      id: 1,
      title: 'Test title 1',
      name: 'Test 1',
      summary: 'foo bar',
      visitId: '1',
      doi: 'doi 1',
      startDate: 1563940800000,
    };

    const { rerender } = render(
      <InvestigationDetailsPanel rowData={rowData} />
    );

    expect(screen.getByText('Test title 1')).toBeInTheDocument();
    expect(screen.getByText('Test 1')).toBeInTheDocument();
    expect(screen.getByText('24/07/2019')).toBeInTheDocument();
    expect(screen.getByText('app.unknown')).toBeInTheDocument();

    rowData.endDate = 1564027200000;
    delete rowData.startDate;
    rerender(<InvestigationDetailsPanel rowData={rowData} />);

    expect(screen.getByText('Test title 1')).toBeInTheDocument();
    expect(screen.getByText('Test 1')).toBeInTheDocument();
    expect(screen.getByText('25/07/2019')).toBeInTheDocument();
    expect(screen.getByText('app.unknown')).toBeInTheDocument();
  });
});
