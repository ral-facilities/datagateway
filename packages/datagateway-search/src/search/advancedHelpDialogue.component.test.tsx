import * as React from 'react';
import AdvancedHelpDialogue from './advancedHelpDialogue.component';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { dGCommonInitialState } from 'datagateway-common';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import type { RenderResult } from '@testing-library/react';
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';

import { initialState as dgSearchInitialState } from '../state/reducers/dgsearch.reducer';
import { StateType } from '../state/app.types';
import userEvent from '@testing-library/user-event';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

function renderComponent({ initialState }): RenderResult {
  return render(
    <Provider store={configureStore([thunk])(initialState)}>
      <MemoryRouter>
        <AdvancedHelpDialogue />
      </MemoryRouter>
    </Provider>
  );
}

describe('Advanced help dialogue', () => {
  let state: StateType;

  beforeEach(() => {
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgsearch: dgSearchInitialState,
      })
    );
  });

  it('is hidden initially', () => {
    renderComponent({ initialState: state });
    expect(
      screen.queryByRole('dialog', { name: 'Advanced Search Tips' })
    ).toBeNull();
  });

  it('opens when search options link is clicked and closes when the close button is clicked', async () => {
    const user = userEvent.setup();

    renderComponent({ initialState: state });

    await user.click(
      screen.getByRole('button', {
        name: 'advanced_search_help.search_options_arialabel',
      })
    );

    expect(
      screen.getByRole('dialog', { name: 'Advanced Search Tips' })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'advanced_search_help.close_button_arialabel',
      })
    );

    await waitForElementToBeRemoved(
      screen.getByRole('dialog', { name: 'Advanced Search Tips' })
    );
    expect(
      screen.queryByRole('dialog', { name: 'Advanced Search Tips' })
    ).toBeNull();
  });
});
