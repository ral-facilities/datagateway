import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event/setup/setup';
import * as React from 'react';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import DGDataViewReducer from '../../../state/reducers/dgdataview.reducer';
import RightAlignedControls from './rightAlignedControls';

function renderComponent(): RenderResult {
  const store = createStore(
    combineReducers({
      dgdataview: DGDataViewReducer,
    })
  );

  return render(
    <Provider store={store}>
      <RightAlignedControls />
    </Provider>
  );
}

describe('RightAlignedControls', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('should have a control that shows the current zoom level of the datafile previewer', () => {
    renderComponent();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should have a switch that toggles the details pane of the datafile previewer', async () => {
    renderComponent();

    expect(
      screen.getByRole('checkbox', {
        name: 'datafiles.preview.toolbar.show_details',
      })
    ).toBeChecked();

    await user.click(
      screen.getByRole('checkbox', {
        name: 'datafiles.preview.toolbar.show_details',
      })
    );

    expect(
      await screen.findByRole('checkbox', {
        name: 'datafiles.preview.toolbar.show_details',
      })
    ).not.toBeChecked();
  });

  it('should increase zoom level of the datafile previewer when scrolling up on the zoom level control', async () => {
    renderComponent();

    // pretend user is scrolling up on the test div
    fireEvent.wheel(screen.getByText('100%'), {
      deltaY: -100,
    });

    expect(await screen.findByText('110%')).toBeInTheDocument();
  });

  it('should decrease zoom level of the datafile previewer when scrolling up on the zoom level control', async () => {
    renderComponent();

    // pretend user is scrolling up on the test div
    fireEvent.wheel(screen.getByText('100%'), {
      deltaY: 100,
    });

    expect(await screen.findByText('90%')).toBeInTheDocument();
  });
});
