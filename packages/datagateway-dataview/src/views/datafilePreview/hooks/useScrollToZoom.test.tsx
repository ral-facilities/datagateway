import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { Provider } from 'react-redux';
import { DeepPartial } from 'redux';
import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import { DGDataViewState } from '../../../state/app.types';
import {
  DecrementDatafilePreviewerZoomLevelType,
  IncrementDatafilePreviewerZoomLevelType,
} from '../state/actions';
import useScrollToZoom from './useScrollToZoom';

/**
 * A simple test component that consumes useScrollToZoom.
 */
function TestComponent(): JSX.Element {
  const ref = React.useRef<HTMLDivElement>();
  useScrollToZoom({ targetElement: ref });
  return <div ref={ref}>Scroll me</div>;
}

const mockStore = configureStore([]);

describe('useScrollToZoom', () => {
  let state: DeepPartial<DGDataViewState>;
  let store: MockStoreEnhanced;

  beforeEach(() => {
    state = {
      isisDatafilePreviewer: {
        zoomLevel: 1,
      },
    };
    store = mockStore(state);
  });

  it('should zoom in previewer content when user scroll up on the target element', async () => {
    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    );

    // pretend user is scrolling up on the test div
    fireEvent.wheel(screen.getByText('Scroll me'), {
      deltaY: -100,
    });

    expect(store.getActions()).toEqual([
      { type: IncrementDatafilePreviewerZoomLevelType },
    ]);
  });

  it('should zoom out of previewer content when user scroll down on the target element', async () => {
    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    );

    // pretend user is scrolling down on the test div
    fireEvent.wheel(screen.getByText('Scroll me'), {
      deltaY: 100,
    });

    expect(store.getActions()).toEqual([
      { type: DecrementDatafilePreviewerZoomLevelType },
    ]);
  });
});
