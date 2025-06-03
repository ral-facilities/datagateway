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
import reactI18Next from 'react-i18next';

vi.mock('react-redux', async () => ({
  ...(await vi.importActual('react-redux')),
  useSelector: vi.fn(),
}));

function renderComponent({
  initialState,
}: {
  initialState: StateType;
}): RenderResult {
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
  const tSpy = vi.fn((str) => str);
  let originalUseTranslation: typeof reactI18Next.useTranslation;

  beforeEach(() => {
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgsearch: dgSearchInitialState,
      })
    );

    originalUseTranslation = reactI18Next.useTranslation;
    reactI18Next.useTranslation = vi.fn().mockReturnValue([tSpy]);
  });

  afterEach(() => {
    reactI18Next.useTranslation = originalUseTranslation;
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

    await user.click(screen.getByTestId('advanced-search-help-link'));

    expect(
      screen.getByRole('dialog', { name: 'advanced_search_help.title' })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'advanced_search_help.close_button_arialabel',
      })
    );

    // advanced_search_help.examples.examples is not an array so example section is not rendered
    expect(
      screen.queryByText('advanced_search_help.examples.title')
    ).not.toBeInTheDocument();

    await waitForElementToBeRemoved(
      screen.getByRole('dialog', { name: 'advanced_search_help.title' })
    );
    expect(
      screen.queryByRole('dialog', { name: 'advanced_search_help.title' })
    ).toBeNull();
  });

  it('renders examples section when an example is given', async () => {
    tSpy.mockImplementation((key) => {
      if (key === 'advanced_search_help.examples.examples') {
        return [{ name: 'example 1', value: 'example 1' }];
      } else return key;
    });
    const user = userEvent.setup();

    renderComponent({ initialState: state });

    await user.click(screen.getByTestId('advanced-search-help-link'));

    expect(
      screen.getByRole('dialog', { name: 'advanced_search_help.title' })
    ).toBeInTheDocument();

    // advanced_search_help.examples.examples is an array with items in it so we should render example section
    expect(
      screen.getByText('advanced_search_help.examples.title')
    ).toBeInTheDocument();
  });
});
