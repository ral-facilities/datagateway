import * as React from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { render, RenderResult, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  DatasetDatafileCountCell,
  DatasetSizeCell,
  InvestigationDatasetCountCell,
  InvestigationSizeCell,
} from './cellRenderers';
import {
  Dataset,
  dGCommonInitialState,
  Investigation,
  StateType,
} from 'datagateway-common';

setLogger({
  log: console.log,
  warn: console.warn,
  error: jest.fn(),
});

describe('cellRenderers', () => {
  function Wrapper({ children }: { children: React.ReactNode }): JSX.Element {
    return (
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: {
              queries: { retry: false },
            },
          })
        }
      >
        <Provider
          store={configureStore<Partial<StateType>>([thunk])({
            dgcommon: dGCommonInitialState,
          })}
        >
          {children}
        </Provider>
      </QueryClientProvider>
    );
  }

  describe('InvestigationDatasetCountCell', () => {
    const mockInvestigation: Investigation = {
      id: 1,
      name: 'mock investigation',
      title: 'mock investigation title',
      visitId: '123',
    };

    function renderComponent(): RenderResult {
      return render(
        <InvestigationDatasetCountCell investigation={mockInvestigation} />,
        {
          wrapper: Wrapper,
        }
      );
    }

    it('displays calculating message when the count is being fetched', async () => {
      axios.get = jest.fn().mockImplementation(
        () =>
          new Promise((_) => {
            // never resolve the promise to pretend it is still loading
          })
      );

      renderComponent();

      expect(await screen.findByText('Calculating...')).toBeInTheDocument();
    });

    it('displays unknown if query is unsuccessful', async () => {
      axios.get = jest.fn().mockRejectedValueOnce({
        response: {
          status: 403,
        },
      } as Partial<AxiosError>);

      renderComponent();

      expect(await screen.findByText('Unknown')).toBeInTheDocument();
    });

    it('displays dataset count for the given investigation', async () => {
      axios.get = jest.fn().mockResolvedValueOnce({
        data: 123,
      } as Partial<AxiosResponse<number>>);

      renderComponent();

      expect(await screen.findByText('123')).toBeInTheDocument();
    });
  });

  describe('InvestigationSizeCell', () => {
    const mockInvestigation: Investigation = {
      id: 1,
      name: 'mock investigation',
      title: 'mock investigation title',
      visitId: '123',
    };

    function renderComponent(): RenderResult {
      return render(
        <InvestigationSizeCell investigation={mockInvestigation} />,
        {
          wrapper: Wrapper,
        }
      );
    }

    it('displays calculating message when the size is being fetched', async () => {
      axios.get = jest.fn().mockImplementation(
        () =>
          new Promise((_) => {
            // never resolve the promise to pretend it is still loading
          })
      );

      renderComponent();

      expect(await screen.findByText('Calculating...')).toBeInTheDocument();
    });

    it('displays unknown if query is unsuccessful', async () => {
      axios.get = jest.fn().mockRejectedValueOnce({
        response: {
          status: 403,
        },
      } as Partial<AxiosError>);

      renderComponent();

      expect(await screen.findByText('Unknown')).toBeInTheDocument();
    });

    it('displays dataset count for the given investigation', async () => {
      axios.get = jest.fn().mockResolvedValueOnce({
        data: 123,
      } as Partial<AxiosResponse<number>>);

      renderComponent();

      expect(await screen.findByText('123 B')).toBeInTheDocument();
    });
  });

  describe('DatasetDatafileCountCell', () => {
    const mockDataset: Dataset = {
      id: 1,
      name: 'mock investigation',
      modTime: 'mod time',
      createTime: 'create time',
    };

    function renderComponent(): RenderResult {
      return render(<DatasetDatafileCountCell dataset={mockDataset} />, {
        wrapper: Wrapper,
      });
    }

    it('displays calculating message when the count is being fetched', async () => {
      axios.get = jest.fn().mockImplementation(
        () =>
          new Promise((_) => {
            // never resolve the promise to pretend it is still loading
          })
      );

      renderComponent();

      expect(await screen.findByText('Calculating...')).toBeInTheDocument();
    });

    it('displays unknown if query is unsuccessful', async () => {
      axios.get = jest.fn().mockRejectedValueOnce({
        response: {
          status: 403,
        },
      } as Partial<AxiosError>);

      renderComponent();

      expect(await screen.findByText('Unknown')).toBeInTheDocument();
    });

    it('displays datafile count for the given dataset', async () => {
      axios.get = jest.fn().mockResolvedValueOnce({
        data: 123,
      } as Partial<AxiosResponse<number>>);

      renderComponent();

      expect(await screen.findByText('123')).toBeInTheDocument();
    });
  });

  describe('DatasetSizeCell', () => {
    const mockDataset: Dataset = {
      id: 1,
      name: 'mock investigation',
      modTime: 'mod time',
      createTime: 'create time',
    };

    function renderComponent(): RenderResult {
      return render(<DatasetSizeCell dataset={mockDataset} />, {
        wrapper: Wrapper,
      });
    }

    it('displays calculating message when the size is being fetched', async () => {
      axios.get = jest.fn().mockImplementation(
        () =>
          new Promise((_) => {
            // never resolve the promise to pretend it is still loading
          })
      );

      renderComponent();

      expect(await screen.findByText('Calculating...')).toBeInTheDocument();
    });

    it('displays unknown if query is unsuccessful', async () => {
      axios.get = jest.fn().mockRejectedValueOnce({
        response: {
          status: 403,
        },
      } as Partial<AxiosError>);

      renderComponent();

      expect(await screen.findByText('Unknown')).toBeInTheDocument();
    });

    it('displays dataset count for the given investigation', async () => {
      axios.get = jest.fn().mockResolvedValueOnce({
        data: 123,
      } as Partial<AxiosResponse<number>>);

      renderComponent();

      expect(await screen.findByText('123 B')).toBeInTheDocument();
    });
  });
});
