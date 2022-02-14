import React from 'react';
import AdvancedHelpDialogue from './advancedHelpDialogue.component';
import { Provider, useSelector } from 'react-redux';
import thunk from 'redux-thunk';
import { dGCommonInitialState } from 'datagateway-common';
import { initialState as dgSearchInitialState } from '../state/reducers/dgsearch.reducer';
import configureStore from 'redux-mock-store';
import { mount, ReactWrapper, shallow } from 'enzyme';
import { StateType } from '../state/app.types';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

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
        <AdvancedHelpDialogue />
      </Provider>
    );
  };

  it('renders correctly', () => {
    useSelector.mockImplementation(() => {
      return dgSearchInitialState;
    });

    const wrapper = shallow(<AdvancedHelpDialogue />);
    expect(wrapper).toMatchSnapshot();
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
