import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import { DGThemeProvider } from 'datagateway-common';
import * as React from 'react';
import { Provider } from 'react-redux';
import { combineReducers, createStore, Store } from 'redux';
import { StateType } from '../../../state/app.types';
import dgdataviewReducer from '../../../state/reducers/dgdataview.reducer';
import {
  DecrementDatafilePreviewerZoomLevelType,
  IncrementDatafilePreviewerZoomLevelType,
} from '../state/actions';
import { mockDatafile, mockTxtFileContent } from '../testData';
import TxtPreview from './txtPreview.component';

function renderComponent(store: Store): RenderResult {
  return render(
    <DGThemeProvider>
      <Provider store={store}>
        <TxtPreview
          datafile={mockDatafile}
          datafileContent={new Blob([mockTxtFileContent])}
        />
      </Provider>
    </DGThemeProvider>
  );
}

describe('TxtPreview', () => {
  let store: Store;

  beforeEach(() => {
    store = createStore(
      combineReducers<Partial<StateType>>({
        dgdataview: dgdataviewReducer,
      })
    );
  });

  it('should render given text file', () => {
    const { asFragment } = renderComponent(store);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should show loading when reading the text file from blob', () => {
    jest.spyOn(global, 'Blob').mockImplementationOnce(() => ({
      size: 123,
      type: 'text/plain',
      arrayBuffer: jest.fn(),
      slice: jest.fn(),
      stream: jest.fn(),
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

  describe('when the zoom level of datafile previewer changes', () => {
    it('should increase the font size if the zoom is increased', async () => {
      renderComponent(store);

      await waitFor(
        () =>
          screen.queryByText('datafiles.preview.txt.reading_content') === null
      );

      // increase the zoom level
      store.dispatch({
        type: IncrementDatafilePreviewerZoomLevelType,
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
      store.dispatch({
        type: DecrementDatafilePreviewerZoomLevelType,
      });

      expect(
        await screen.findByLabelText('datafiles.preview.txt.file_content_label')
      ).toHaveStyle({
        'font-size': '11px',
      });
    });
  });
});
