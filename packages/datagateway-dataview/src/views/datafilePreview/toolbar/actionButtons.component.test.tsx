import {
  act,
  render,
  type RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event/setup/setup';
import { downloadDatafile } from 'datagateway-common';
import * as React from 'react';
import { Provider } from 'react-redux';
import type { Store } from 'redux';
import { combineReducers, createStore } from 'redux';
import type { StateType } from '../../../state/app.types';
import DGDataViewReducer from '../../../state/reducers/dgdataview.reducer';
import DatafilePreviewerContext, {
  DatafilePreviewerContextShape,
} from '../datafilePreviewerContext';
import { mockDatafile } from '../testData';
import ActionButtons from './actionButtons.component';

jest.mock('datagateway-common', () => ({
  ...jest.requireActual('datagateway-common'),
  downloadDatafile: jest.fn(),
}));

function renderComponent({
  context,
  store,
}: {
  context?: DatafilePreviewerContextShape;
  store: Store;
}): RenderResult {
  const mockContext: DatafilePreviewerContextShape = context ?? {
    datafile: mockDatafile,
  };

  return render(
    <Provider store={store}>
      <DatafilePreviewerContext.Provider value={mockContext}>
        <ActionButtons />
      </DatafilePreviewerContext.Provider>
    </Provider>
  );
}

describe('ActionButtons', () => {
  let user: UserEvent;
  let store: Store<StateType>;

  beforeEach(() => {
    user = userEvent.setup();
    store = createStore(
      combineReducers({
        dgcommon: (_, __) => ({
          urls: {
            idsUrl: 'ids',
          },
        }),
        dgdataview: DGDataViewReducer,
      })
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should not show anything when datafile previewer context is not provided', () => {
    const { container } = render(
      <Provider store={store}>
        <ActionButtons />
      </Provider>
    );
    expect(container.children).toHaveLength(0);
  });

  describe('should have a download button that', () => {
    it('lets users download the currently previewed datafile', async () => {
      renderComponent({
        store,
        context: {
          datafile: mockDatafile,
          datafileContent: new Blob(['hello']),
        },
      });

      await user.click(
        screen.getByRole('button', { name: 'buttons.download' })
      );

      expect(downloadDatafile).toHaveBeenCalledTimes(1);
    });

    it('does nothing when datafile location is not available', async () => {
      const { location, ...datafileWithNoLocation } = mockDatafile;

      renderComponent({
        store,
        context: {
          datafile: datafileWithNoLocation,
          datafileContent: new Blob(['hello']),
        },
      });

      await user.click(
        screen.getByRole('button', { name: 'buttons.download' })
      );

      expect(downloadDatafile).not.toHaveBeenCalled();
    });
  });

  it('should have a copy link button that copies the link to the current datafile to the clipboard', async () => {
    const ogLocation = window.location;
    const mockLocation = new URL(
      `https://www.example.com/datafile/${mockDatafile.id}`
    );
    delete window.location;
    window.location = mockLocation;
    const writeTextSpy = jest
      .spyOn(navigator.clipboard, 'writeText')
      .mockImplementationOnce(() => Promise.resolve());

    renderComponent({ store });

    await user.click(
      screen.getByRole('button', {
        name: 'datafiles.preview.toolbar.copy_link',
      })
    );

    expect(writeTextSpy).toHaveBeenCalledWith(
      `https://www.example.com/datafile/${mockDatafile.id}`
    );

    delete window.location;
    window.location = ogLocation;
  });

  it('should show confirmation when the link to the current datafile is successfully copied to the clipboard', async () => {
    jest.useFakeTimers();
    user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    const ogLocation = window.location;
    const mockLocation = new URL('https://www.example.com');
    delete window.location;
    window.location = mockLocation;

    renderComponent({ store });

    await user.click(
      screen.getByRole('button', {
        name: 'datafiles.preview.toolbar.copy_link',
      })
    );

    expect(
      await screen.findByText('datafiles.preview.link_copied')
    ).toBeInTheDocument();

    // confirmation message should be dismissed automatically
    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.queryByText('datafiles.preview.link_copied')).toBeNull();
    });

    delete window.location;
    window.location = ogLocation;

    jest.useRealTimers();
  });

  it('should have a zoom in button that increases the zoom level of the datafile previewer when clicked', async () => {
    renderComponent({ store });

    await user.click(
      screen.getByRole('button', {
        name: 'datafiles.preview.toolbar.zoom_in',
      })
    );

    expect(store.getState().dgdataview.isisDatafilePreviewer.zoomLevel).toEqual(
      110
    );
  });

  it('should have a zoom out button that decreases the zoom level of the datafile previewer when clicked', async () => {
    renderComponent({ store });

    await user.click(
      screen.getByRole('button', {
        name: 'datafiles.preview.toolbar.zoom_out',
      })
    );

    expect(store.getState().dgdataview.isisDatafilePreviewer.zoomLevel).toEqual(
      90
    );
  });

  describe('should have a reset zoom button', () => {
    it('that is hidden when the zoom level of the datafile previewer is at the default value', () => {
      renderComponent({ store });

      expect(
        screen.queryByRole('button', {
          name: 'datafiles.preview.toolbar.reset_zoom',
        })
      ).toBeNull();
    });

    it('that is shown when the zoom level of the datafile previewer is changed and resets it when clicked', async () => {
      renderComponent({ store });

      // click the zoom in button to change the zoom level
      await user.click(
        screen.getByRole('button', {
          name: 'datafiles.preview.toolbar.zoom_in',
        })
      );

      await user.click(
        await screen.findByRole('button', {
          name: 'datafiles.preview.toolbar.reset_zoom',
        })
      );

      expect(
        store.getState().dgdataview.isisDatafilePreviewer.zoomLevel
      ).toEqual(100);
      await waitFor(() => {
        expect(
          screen.queryByRole('button', {
            name: 'datafiles.preview.toolbar.reset_zoom',
          })
        ).toBeNull();
      });
    });
  });
});
