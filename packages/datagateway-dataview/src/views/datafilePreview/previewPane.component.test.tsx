import { type RenderResult, render, screen } from '@testing-library/react';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import DGDataViewReducer from '../../state/reducers/dgdataview.reducer';
import DatafilePreviewerContext from './datafilePreviewerContext';
import PreviewPane from './previewPane.component';
import { mockDatafile, mockTxtFileContent } from './testData';

function renderComponent(): RenderResult {
  return render(
    <Provider
      store={createStore(
        combineReducers({
          dgdataview: DGDataViewReducer,
        })
      )}
    >
      <DatafilePreviewerContext.Provider
        value={{
          datafile: mockDatafile,
          datafileContent: new Blob([mockTxtFileContent]),
        }}
      >
        <QueryClientProvider
          client={
            new QueryClient({ defaultOptions: { queries: { retry: false } } })
          }
        >
          <PreviewPane datafileExtension="txt" />
        </QueryClientProvider>
      </DatafilePreviewerContext.Provider>
    </Provider>
  );
}

describe('PreviewPane', () => {
  it('should use the correct preview component according to the given datafile extension', async () => {
    renderComponent();

    expect(
      await screen.findByLabelText('datafiles.preview.txt.file_content_label')
    ).toBeInTheDocument();
    expect(screen.getByText('First line')).toBeInTheDocument();
    expect(screen.getByText('Second line')).toBeInTheDocument();
    expect(screen.getByText('Third line')).toBeInTheDocument();
  });

  it('should render nothing if datafile previewer context is not provided', () => {
    const { container } = render(<PreviewPane datafileExtension="txt" />);
    expect(container.children).toHaveLength(0);
  });

  it('should render nothing if datafile content is unavailable', () => {
    const { container } = render(
      <DatafilePreviewerContext.Provider
        value={{
          datafile: mockDatafile,
        }}
      >
        <PreviewPane datafileExtension="txt" />
      </DatafilePreviewerContext.Provider>
    );
    expect(container.children).toHaveLength(0);
  });
});
