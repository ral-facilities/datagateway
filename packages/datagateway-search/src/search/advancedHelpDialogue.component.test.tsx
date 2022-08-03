import * as React from 'react';
import AdvancedHelpDialogue from './advancedHelpDialogue.component';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { dGCommonInitialState } from 'datagateway-common';
import configureStore from 'redux-mock-store';
import { mount, ReactWrapper } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import type { RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';

import { initialState as dgSearchInitialState } from '../state/reducers/dgsearch.reducer';
import { StateType } from '../state/app.types';

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

describe('Advanced help dialogue component tests', () => {
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgsearch: dgSearchInitialState,
      })
    );
  });

  const createWrapper = (): ReactWrapper => {
    return mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <AdvancedHelpDialogue />
        </MemoryRouter>
      </Provider>
    );
  };

  it('renders correctly', () => {
    const { asFragment } = renderComponent({ initialState: state });
    expect(asFragment()).toMatchSnapshot();
  });

  it('can open and close help dialogue', () => {
    const wrapper = createWrapper();
    wrapper
      .find('[aria-label="advanced_search_help.search_options_arialabel"]')
      .last()
      .simulate('click');
    expect(
      wrapper
        .find('[aria-labelledby="advanced-search-dialog-title"]')
        .first()
        .prop('open')
    ).toBe(true);
    wrapper
      .find('[aria-label="advanced_search_help.close_button_arialabel"]')
      .last()
      .simulate('click');
    expect(
      wrapper
        .find('[aria-labelledby="advanced-search-dialog-title"]')
        .first()
        .prop('open')
    ).toBe(false);
  });
});
