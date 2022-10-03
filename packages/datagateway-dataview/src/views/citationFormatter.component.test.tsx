import React from 'react';
import CitationFormatter from './citationFormatter.component';
import axios from 'axios';
import {
  render,
  type RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

describe('Citation formatter component tests', () => {
  let queryClient;
  let user: UserEvent;

  const props = {
    doi: 'test',
    formattedUsers: [
      { role: 'principal_experimenter', fullName: 'John Smith' },
    ],
    title: 'title',
    startDate: '2019-04-03',
  };

  const renderComponent = (componentProps): RenderResult =>
    render(
      <QueryClientProvider client={queryClient}>
        <CitationFormatter {...componentProps} />
      </QueryClientProvider>
    );

  beforeEach(() => {
    user = userEvent.setup();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
  });

  it('renders correctly', async () => {
    renderComponent(props);

    expect(
      await screen.findByText('studies.details.citation_formatter.label')
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        'studies.details.citation_formatter.details studies.details.citation_formatter.details_select_format'
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        'studies.details.citation_formatter.default_format'
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        'John Smith; 2019: title, doi_constants.publisher.name, https://doi.org/test'
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', {
        name: 'studies.details.citation_formatter.copy_citation_arialabel',
      })
    ).toBeEnabled();
  });

  it('renders correctly without a doi', async () => {
    const newProps = { ...props, doi: undefined };
    renderComponent(newProps);

    expect(
      await screen.findByText('studies.details.citation_formatter.label')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('studies.details.citation_formatter.details')
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(
        'studies.details.citation_formatter.select_arialabel'
      )
    ).toBeNull();
    expect(
      await screen.findByText(
        'John Smith; 2019: title, doi_constants.publisher.name'
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', {
        name: 'studies.details.citation_formatter.copy_citation_arialabel',
      })
    ).toBeEnabled();
  });

  it('sends axios request to fetch a formatted citation when a format is selected', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: 'This is a test',
    });

    renderComponent(props);

    // click on the format dropdown
    await user.click(
      within(
        await screen.findByLabelText(
          'studies.details.citation_formatter.select_arialabel'
        )
      ).getByRole('button')
    );
    // then select the format2 option
    await user.click(await screen.findByRole('option', { name: 'format2' }));

    const params = new URLSearchParams({
      style: 'format2',
      locale: 'studies.details.citation_formatter.locale',
    });

    expect(axios.get).toHaveBeenCalledWith(
      'https://api.datacite.org/text/x-bibliography/test',
      expect.objectContaining({
        params,
      })
    );
    expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
      params.toString()
    );

    expect(await screen.findByText('This is a test')).toBeInTheDocument();
    expect(
      await screen.findByRole('button', {
        name: 'studies.details.citation_formatter.copy_citation_arialabel',
      })
    ).toBeEnabled();
  });

  it('copies data citation to clipboard', async () => {
    renderComponent(props);

    // Mock the clipboard object
    const testWriteText = jest.spyOn(navigator.clipboard, 'writeText');

    expect(
      await screen.findByText(
        'John Smith; 2019: title, doi_constants.publisher.name, https://doi.org/test'
      )
    ).toBeInTheDocument();

    await user.click(
      await screen.findByRole('button', {
        name: 'studies.details.citation_formatter.copy_citation_arialabel',
      })
    );

    expect(testWriteText).toHaveBeenCalledWith(
      'John Smith; 2019: title, doi_constants.publisher.name, https://doi.org/test'
    );
    expect(
      await screen.findByRole('button', {
        name: 'studies.details.citation_formatter.copied_citation',
      })
    ).toBeInTheDocument();
  });

  it('displays error message when axios request to fetch a formatted citation fails', async () => {
    console.error = jest.fn();

    (axios.get as jest.Mock).mockRejectedValueOnce({
      message: 'error',
    });

    renderComponent(props);

    // click on the format dropdown
    await user.click(
      within(
        await screen.findByLabelText(
          'studies.details.citation_formatter.select_arialabel'
        )
      ).getByRole('button')
    );
    // then select the format2 option
    await user.click(await screen.findByRole('option', { name: 'format2' }));

    const params = new URLSearchParams({
      style: 'format2',
      locale: 'studies.details.citation_formatter.locale',
    });

    expect(axios.get).toHaveBeenCalledWith(
      'https://api.datacite.org/text/x-bibliography/test',
      expect.objectContaining({
        params,
      })
    );
    expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
      params.toString()
    );

    expect(
      await screen.findByText('studies.details.citation_formatter.error')
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', {
        name: 'studies.details.citation_formatter.copy_citation_arialabel',
      })
    ).toBeDisabled();
  });

  it('displays loading spinner while waiting for a response from DataCite', async () => {
    let reject: () => void;
    (axios.get as jest.Mock).mockReturnValueOnce(
      new Promise((_, _reject) => {
        reject = _reject;
      })
    );

    renderComponent(props);

    // click on the format dropdown
    await user.click(
      within(
        await screen.findByLabelText(
          'studies.details.citation_formatter.select_arialabel'
        )
      ).getByRole('button')
    );
    // then select the format2 option
    await user.click(await screen.findByRole('option', { name: 'format2' }));

    expect(await screen.findByRole('progressbar')).toBeInTheDocument();

    reject();
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
    });
  });
});
