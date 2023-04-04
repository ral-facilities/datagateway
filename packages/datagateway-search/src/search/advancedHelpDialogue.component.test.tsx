import * as React from 'react';
import AdvancedHelpDialogue from './advancedHelpDialogue.component';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { dGCommonInitialState } from 'datagateway-common';
import { initialState as dgSearchInitialState } from '../state/reducers/dgsearch.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import { MemoryRouter } from 'react-router-dom';
import {
  render,
  type RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

describe('Advanced help dialogue component tests', () => {
  let mockStore;
  let state: StateType;
  let user: UserEvent;

  beforeEach(() => {
    mockStore = configureStore([thunk]);
    user = userEvent.setup();
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgsearch: dgSearchInitialState,
      })
    );
  });

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <AdvancedHelpDialogue />
        </MemoryRouter>
      </Provider>
    );

  it('can open and close help dialogue', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', {
        name: 'advanced_search_help.search_options_arialabel',
      })
    );

    expect(await screen.findByText('Advanced Search Tips')).toBeInTheDocument();

    await user.click(
      await screen.findByRole('button', {
        name: 'advanced_search_help.close_button_arialabel',
      })
    );

    await waitFor(() => {
      expect(screen.queryByText('Advanced Search Tips')).toBeNull();
    });
  });
});
