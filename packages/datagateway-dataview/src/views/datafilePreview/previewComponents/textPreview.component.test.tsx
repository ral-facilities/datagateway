import type { RenderResult } from '@testing-library/react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { DGThemeProvider } from 'datagateway-common';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { combineReducers, createStore, Store } from 'redux';
import { StateType } from '../../../state/app.types';
import dgdataviewReducer from '../../../state/reducers/dgdataview.reducer';
import {
  DecrementDatafilePreviewerZoomLevelType,
  IncrementDatafilePreviewerZoomLevelType,
} from '../state/actions';
import { mockDatafile, mockTxtFileContent } from '../testData';
import TextPreview from './textPreview.component';

function renderComponent(store: Store): RenderResult {
  return render(
    <DGThemeProvider>
      <Provider store={store}>
        <QueryClientProvider
          client={
            new QueryClient({
              defaultOptions: { queries: { retry: false } },
              // silence react-query errors
              logger: {
                log: console.log,
                warn: console.warn,
                error: vi.fn(),
              },
            })
          }
        >
          <TextPreview
            datafile={mockDatafile}
            datafileContent={new Blob([mockTxtFileContent])}
          />
        </QueryClientProvider>
      </Provider>
    </DGThemeProvider>
  );
}

describe('TextPreview', () => {
  let store: Store;

  beforeEach(() => {
    store = createStore(
      combineReducers<Partial<StateType>>({
        dgdataview: dgdataviewReducer,
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render given text file', async () => {
    const { asFragment } = renderComponent(store);
    // wait for the preview to finish loading
    await waitFor(() => {
      expect(
        screen.queryByText('datafiles.preview.txt.reading_content')
      ).toBeNull();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it('should show loading when reading the text file from blob', () => {
    vi.spyOn(global, 'Blob').mockImplementationOnce(() => ({
      size: 123,
      type: 'text/plain',
      arrayBuffer: vi.fn(),
      slice: vi.fn(),
      stream: vi.fn(),
      text: () =>
        new Promise<string>(() => {
          // a promise that never resolves to pretend this is reading content
        }),
    }));

    renderComponent(store);

    expect(
      screen.getByText('datafiles.preview.txt.reading_content')
    ).toBeInTheDocument();
  });

  it('should show an error message when the blob cannot be read as text properly', async () => {
    vi.spyOn(global, 'Blob').mockImplementationOnce(() => ({
      size: 123,
      type: 'text/plain',
      arrayBuffer: vi.fn(),
      slice: vi.fn(),
      stream: vi.fn(),
      text: () => Promise.reject(),
    }));

    renderComponent(store);

    expect(
      await screen.findByText('datafiles.preview.txt.cannot_read_content')
    ).toBeInTheDocument();
  });

  describe('when the zoom level of datafile previewer changes', () => {
    it('should increase the font size if the zoom is increased', async () => {
      renderComponent(store);

      await waitFor(
        () =>
          screen.queryByText('datafiles.preview.txt.reading_content') === null
      );

      // increase the zoom level
      act(() => {
        store.dispatch({
          type: IncrementDatafilePreviewerZoomLevelType,
        });
      });

      expect(
        await screen.findByLabelText('datafiles.preview.txt.file_content_label')
      ).toHaveStyle({
        'font-size': '13px',
      });
    });

    it('should decrease the font size if the zoom is decreased', async () => {
      renderComponent(store);

      await waitFor(
        () =>
          screen.queryByText('datafiles.preview.txt.reading_content') === null
      );

      // increase the zoom level
      act(() => {
        store.dispatch({
          type: DecrementDatafilePreviewerZoomLevelType,
        });
      });

      expect(
        await screen.findByLabelText('datafiles.preview.txt.file_content_label')
      ).toHaveStyle({
        'font-size': '11px',
      });
    });
  });
});
