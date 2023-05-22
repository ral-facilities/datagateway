import * as React from 'react';
import { SemanticSearchResults } from 'datagateway-common/src';
import axios from 'axios';
import { render, waitFor, within } from '@testing-library/react';
import SemanticSearchTable from './semanticSearchTable.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import {
  findAllRows,
  findCellInRow,
  findColumnIndexByName,
} from '../setupTests';

const mockSemanticSearchResults: SemanticSearchResults = [
  {
    score: 0.1,
    doc: {
      id: 1,
      visitId: '1',
      name: 'Mock investigation 1 name',
      title: 'Mock investigation 1',
      summary: 'Mock investigation 1 summary',
    },
  },
  {
    score: 0.2,
    doc: {
      id: 2,
      visitId: '2',
      name: 'Mock investigation 2 name',
      title: 'Mock investigation 2',
      summary: 'Mock investigation 2 summary',
    },
  },
  {
    score: 0.15,
    doc: {
      id: 3,
      visitId: '3',
      name: 'Mock investigation 3 name',
      title: 'Mock investigation 3',
      summary: 'Mock investigation 3 summary',
    },
  },
];

describe('SemanticSearchTable', () => {
  function Wrapper({ children }: { children: React.ReactNode }): JSX.Element {
    return (
      <MemoryRouter initialEntries={[{ search: '?searchText=test' }]}>
        <QueryClientProvider client={new QueryClient()}>
          {children}
        </QueryClientProvider>
      </MemoryRouter>
    );
  }

  it('queries and displays semantic search results in a table', async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: mockSemanticSearchResults,
    });

    render(<SemanticSearchTable />, { wrapper: Wrapper });

    let rows: HTMLElement[];
    await waitFor(async () => {
      rows = await findAllRows();
      expect(rows).toHaveLength(3);
    });

    expect(
      within(
        await findCellInRow(rows[0], {
          columnIndex: await findColumnIndexByName('investigations.title'),
        })
      ).getByText('Mock investigation 2')
    ).toBeInTheDocument();
    expect(
      within(
        await findCellInRow(rows[0], {
          columnIndex: await findColumnIndexByName('investigations.visit_id'),
        })
      ).getByText('2')
    ).toBeInTheDocument();
    expect(
      within(
        await findCellInRow(rows[0], {
          columnIndex: await findColumnIndexByName('investigations.name'),
        })
      ).getByText('Mock investigation 2 name')
    ).toBeInTheDocument();

    expect(
      within(
        await findCellInRow(rows[1], {
          columnIndex: await findColumnIndexByName('investigations.title'),
        })
      ).getByText('Mock investigation 3')
    ).toBeInTheDocument();
    expect(
      within(
        await findCellInRow(rows[1], {
          columnIndex: await findColumnIndexByName('investigations.visit_id'),
        })
      ).getByText('3')
    ).toBeInTheDocument();
    expect(
      within(
        await findCellInRow(rows[1], {
          columnIndex: await findColumnIndexByName('investigations.name'),
        })
      ).getByText('Mock investigation 3 name')
    ).toBeInTheDocument();

    expect(
      within(
        await findCellInRow(rows[2], {
          columnIndex: await findColumnIndexByName('investigations.title'),
        })
      ).getByText('Mock investigation 1')
    ).toBeInTheDocument();
    expect(
      within(
        await findCellInRow(rows[2], {
          columnIndex: await findColumnIndexByName('investigations.visit_id'),
        })
      ).getByText('1')
    ).toBeInTheDocument();
    expect(
      within(
        await findCellInRow(rows[2], {
          columnIndex: await findColumnIndexByName('investigations.name'),
        })
      ).getByText('Mock investigation 1 name')
    ).toBeInTheDocument();
  });
});
