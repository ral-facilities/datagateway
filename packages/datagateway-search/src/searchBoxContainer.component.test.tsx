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

jest.mock('loglevel');

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

describe('SearchBoxContainer - Tests', () => {
  function renderComponent(
    props?: Partial<React.ComponentProps<typeof SearchBoxContainer>>
  ): RenderResult {
    return render(
      <Provider store={configureStore([thunk])(state)}>
        <MemoryRouter>
          <SearchBoxContainer
            restrict={false}
            initiateSearch={jest.fn()}
            loggedInAnonymously={true}
            onSearchTextChange={jest.fn()}
            searchText="initial search text"
            onMyDataCheckboxChange={jest.fn()}
            {...props}
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

    // link to example searchBox.examples_label_link1 should be visible
    expect(
      screen.getByRole('link', { name: '"instrument calibration"' })
    ).toHaveAttribute('href', '/?searchText=searchBox.examples_label_link1');

    // link to example searchBox.examples_label_link2 should be visible
    expect(
      screen.getByRole('link', { name: 'neutron AND scattering' })
    ).toHaveAttribute('href', '/?searchText=searchBox.examples_label_link2');
  });

  it('shows my data checkbox if user is logged in', () => {
    renderComponent({ loggedInAnonymously: false });

    expect(
      screen.getByRole('checkbox', { name: 'check_boxes.my_data' })
    ).toBeInTheDocument();
  });
});

describe('SearchBoxContainerSide - Tests', () => {
  let state: DeepPartial<StateType>;

  function renderComponent(
    props?: Partial<React.ComponentProps<typeof SearchBoxContainer>>
  ): RenderResult {
    return render(
      <Provider store={configureStore([thunk])(state)}>
        <MemoryRouter>
          <SearchBoxContainerSide
            restrict={false}
            initiateSearch={jest.fn()}
            loggedInAnonymously={true}
            onSearchTextChange={jest.fn()}
            searchText=""
            onMyDataCheckboxChange={jest.fn()}
            {...props}
          />
        </MemoryRouter>
      </Provider>
    );
  }

  beforeEach(() => {
    state = {
      dgsearch: {
        sideLayout: true,
        searchableEntities: ['investigation', 'dataset'],
      },
    };
  });

  it('renders searchBoxContainerSide correctly', () => {
    renderComponent();

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
    renderComponent({ loggedInAnonymously: false });

    expect(
      screen.getByRole('checkbox', { name: 'searchBox.my_data_tooltip' })
    ).toBeInTheDocument();
  });
});
