import * as React from 'react';
import type { Investigation, SuggestedInvestigation } from 'datagateway-common';
import axios, { AxiosResponse } from 'axios';
import { render, screen } from '@testing-library/react';
import SuggestedInvestigationsSection from './suggestedInvestigationsSection.component';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from 'react-query';

const mockSuggestions: SuggestedInvestigation[] = [
  {
    id: 1,
    visitId: 'visitId',
    name: 'Suggested investigation 1 name',
    title: 'Suggested investigation 1',
    summary: 'Suggested investigation 1 summary',
    doi: 'doi1',
    score: 0.9,
  },
  {
    id: 2,
    visitId: 'visitId',
    name: 'Suggested investigation 2 name',
    title: 'Suggested investigation 2',
    summary: 'Suggested investigation 2 summary',
    doi: 'doi2',
    score: 0.9,
  },
  {
    id: 3,
    visitId: 'visitId',
    name: 'Suggested investigation 3 name',
    title: 'Suggested investigation 3',
    summary: 'Suggested investigation 3 summary',
    doi: 'doi3',
    score: 0.9,
  },
  {
    id: 4,
    visitId: 'visitId',
    name: 'Suggested investigation 4 name',
    title: 'Suggested investigation 4',
    summary: 'Suggested investigation 4 summary',
    doi: 'doi4',
    score: 0.9,
  },
  {
    id: 5,
    visitId: 'visitId',
    name: 'Suggested investigation 5 name',
    title: 'Suggested investigation 5',
    summary: 'Suggested investigation 5 summary',
    doi: 'doi5',
    score: 0.6,
  },
  {
    id: 6,
    visitId: 'visitId',
    name: 'Suggested investigation 6 name',
    title: 'Suggested investigation 6',
    summary: 'Suggested investigation 6 summary',
    doi: 'doi6',
    score: 0.5,
  },
];

const MOCK_INVESTIGATION: Investigation = {
  id: 1,
  visitId: 'visitId',
  name: 'Mock investigation name',
  title: 'Mock investigation',
  summary: 'Mock investigation summary',
};

describe('SuggestedInvestigationsSection', () => {
  function Wrapper({ children }: { children: React.ReactNode }): JSX.Element {
    return (
      <QueryClientProvider client={new QueryClient()}>
        {children}
      </QueryClientProvider>
    );
  }

  it('should render a paginated list of suggested investigations for the given investigation', async () => {
    axios.get = jest.fn().mockImplementation(
      (): Promise<Partial<AxiosResponse<SuggestedInvestigation[]>>> =>
        Promise.resolve({
          data: mockSuggestions,
        })
    );

    const user = userEvent.setup();

    render(
      <SuggestedInvestigationsSection investigation={MOCK_INVESTIGATION} />,
      { wrapper: Wrapper }
    );

    await user.click(
      await screen.findByRole('button', {
        name: 'investigations.landingPage.similarInvestigations',
      })
    );

    const suggestionLinks = await screen.findAllByRole('link');
    expect(suggestionLinks).toHaveLength(5);

    expect(
      screen.getByRole('link', { name: 'Suggested investigation 1' })
    ).toHaveAttribute('href', 'https://doi.org/doi1');
    expect(
      screen.getByRole('link', { name: 'Suggested investigation 2' })
    ).toHaveAttribute('href', 'https://doi.org/doi2');
    expect(
      screen.getByRole('link', { name: 'Suggested investigation 3' })
    ).toHaveAttribute('href', 'https://doi.org/doi3');
    expect(
      screen.getByRole('link', { name: 'Suggested investigation 4' })
    ).toHaveAttribute('href', 'https://doi.org/doi4');
    expect(
      screen.getByRole('link', { name: 'Suggested investigation 5' })
    ).toHaveAttribute('href', 'https://doi.org/doi5');
    expect(
      screen.queryByRole('link', { name: 'Suggested investigation 6' })
    ).toBeNull();

    // go to the next page
    await user.click(
      screen.getByRole('button', {
        name: 'investigations.landingPage.similarInvestigationListPaginationLabel.nextButton',
      })
    );

    expect(await screen.findAllByRole('link')).toHaveLength(1);
    expect(
      screen.getByRole('link', { name: 'Suggested investigation 6' })
    ).toBeInTheDocument();
  });

  it('should show loading label and be un-expandable when fetching suggestions', () => {
    axios.get = jest.fn().mockImplementation(
      () =>
        new Promise((_) => {
          // never resolve the promise to pretend the query is loading
        })
    );

    render(
      <SuggestedInvestigationsSection investigation={MOCK_INVESTIGATION} />,
      { wrapper: Wrapper }
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'investigations.landingPage.findingSimilarInvestigations',
      })
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('should show empty message when no suggestion is available for the investigation', async () => {
    axios.get = jest.fn().mockImplementation(
      (): Promise<Partial<AxiosResponse<SuggestedInvestigation[]>>> =>
        Promise.resolve({
          data: [],
        })
    );

    const user = userEvent.setup();

    render(
      <SuggestedInvestigationsSection investigation={MOCK_INVESTIGATION} />,
      { wrapper: Wrapper }
    );

    await user.click(
      await screen.findByRole('button', {
        name: 'investigations.landingPage.similarInvestigations',
      })
    );

    expect(
      await screen.findByText('investigations.landingPage.noSuggestion')
    ).toBeInTheDocument();
  });
});
