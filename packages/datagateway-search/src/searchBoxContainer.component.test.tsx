import * as React from 'react';
import { Provider } from 'react-redux';
import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import type { DeepPartial } from 'redux';
import type { StateType } from './state/app.types';

import SearchBoxContainer from './searchBoxContainer.component';
import SearchBoxContainerSide from './searchBoxContainerSide.component';
import { readSciGatewayToken } from 'datagateway-common';

jest.mock('loglevel');

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

jest.mock('datagateway-common', () => ({
  ...jest.requireActual('datagateway-common'),
  readSciGatewayToken: jest.fn(),
}));

describe('SearchBoxContainer - Tests', () => {
  function renderComponent(): RenderResult {
    return render(
      <Provider store={configureStore([thunk])(state)}>
        <MemoryRouter>
          <SearchBoxContainer
            restrict={false}
            initiateSearch={jest.fn()}
            onSearchTextChange={jest.fn()}
            searchText="initial search text"
            onMyDataCheckboxChange={jest.fn()}
          />
        </MemoryRouter>
      </Provider>
    );
  }

  let state: DeepPartial<StateType>;

  beforeEach(() => {
    state = {
      dgsearch: {
        sideLayout: false,
        searchableEntities: ['investigation', 'dataset'],
      },
    };

    (
      readSciGatewayToken as jest.MockedFn<typeof readSciGatewayToken>
    ).mockReturnValue({
      sessionId: '',
      username: 'anon/anon',
    });
  });

  it('renders searchBoxContainer correctly', async () => {
    renderComponent();

    // search text box should be visible
    expect(
      screen.getByRole('searchbox', { name: 'searchBox.search_text_arialabel' })
    ).toBeInTheDocument();

    // search toggle dropdown should be visible
    expect(
      screen.getByRole('button', { name: 'searchBox.checkboxes.types (2)' })
    ).toBeInTheDocument();

    // date select should be visible
    expect(
      screen.getByRole('textbox', { name: 'searchBox.start_date_arialabel' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'searchBox.end_date_arialabel' })
    ).toBeInTheDocument();

    // sort select should be visible
    // default value is sort by score
    expect(
      screen.getByRole('button', { name: 'sort.label sort._score' })
    ).toBeInTheDocument();

    // logged in anonymously so my data checkbox should be hidden
    expect(
      screen.queryByRole('checkbox', { name: 'check_boxes.my_data' })
    ).toBeNull();

    // search button should be visible
    expect(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    ).toBeInTheDocument();

    // link to example instrument calibration should be visible
    expect(
      screen.getByRole('link', { name: '"instrument calibration"' })
    ).toHaveAttribute('href', '/?searchText=%22instrument+calibration%22');

    // link to example neutron and scattering should be visible
    expect(
      screen.getByRole('link', { name: 'neutron AND scattering' })
    ).toHaveAttribute('href', '/?searchText=neutron+AND+scattering');
  });

  it('shows my data checkbox if user is logged in', () => {
    (
      readSciGatewayToken as jest.MockedFn<typeof readSciGatewayToken>
    ).mockReturnValueOnce({
      sessionId: '',
      username: 'user',
    });

    renderComponent({ initialState: state });

    expect(
      screen.getByRole('checkbox', { name: 'check_boxes.my_data' })
    ).toBeInTheDocument();
  });
});

describe('SearchBoxContainerSide - Tests', () => {
  function renderComponent({ initialState }): RenderResult {
    return render(
      <Provider store={configureStore([thunk])(initialState)}>
        <MemoryRouter>
          <SearchBoxContainerSide
            restrict={false}
            initiateSearch={jest.fn()}
            onSearchTextChange={jest.fn()}
            searchText=""
            onMyDataCheckboxChange={jest.fn()}
          />
        </MemoryRouter>
      </Provider>
    );
  }

  let state: DeepPartial<StateType>;

  beforeEach(() => {
    state = {
      dgsearch: {
        sideLayout: true,
        searchableEntities: ['investigation', 'dataset'],
      },
    };

    (
      readSciGatewayToken as jest.MockedFn<typeof readSciGatewayToken>
    ).mockReturnValue({
      sessionId: '',
      username: 'anon/anon',
    });
  });

  it('renders searchBoxContainerSide correctly', () => {
    renderComponent({ initialState: state });

    // search box should be visible
    expect(
      screen.getByRole('searchbox', { name: 'searchBox.search_text_arialabel' })
    ).toBeInTheDocument();

    // search toggle dropdown should be visible
    expect(
      screen.getByRole('button', { name: 'searchBox.checkboxes.types (2)' })
    ).toBeInTheDocument();

    // date select should be visible
    expect(
      screen.getByRole('textbox', { name: 'searchBox.start_date_arialabel' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'searchBox.end_date_arialabel' })
    ).toBeInTheDocument();

    // logged in anonymously so my data checkbox should be hidden
    expect(
      screen.queryByRole('checkbox', { name: 'check_boxes.my_data' })
    ).toBeNull();

    // search button should be visible
    expect(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    ).toBeInTheDocument();
  });

  it('shows my data checkbox if user is logged in', () => {
    (
      readSciGatewayToken as jest.MockedFn<typeof readSciGatewayToken>
    ).mockReturnValue({
      sessionId: '',
      username: 'user',
    });

    renderComponent({ initialState: state });

    expect(
      screen.getByRole('checkbox', { name: 'searchBox.my_data_tooltip' })
    ).toBeInTheDocument();
  });
});
