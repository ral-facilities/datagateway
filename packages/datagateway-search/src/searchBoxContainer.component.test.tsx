import * as React from 'react';

import SearchBoxContainer from './searchBoxContainer.component';
import SearchBoxContainerSide from './searchBoxContainerSide.component';
import { Provider, useSelector } from 'react-redux';
import { initialState } from './state/reducers/dgsearch.reducer';
import { render, type RenderResult, screen } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';

jest.mock('loglevel');

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

describe('SearchBoxContainer - Tests', () => {
  const renderComponent = (): RenderResult =>
    render(
      <MemoryRouter>
        <Provider
          store={configureStore([thunk])({
            dgsearch: initialState,
          })}
        >
          <SearchBoxContainer
            initiateSearch={jest.fn()}
            onSearchTextChange={jest.fn()}
            onSearchTypeChange={jest.fn()}
            searchText="initial search text"
            searchType="lucene"
          />
        </Provider>
      </MemoryRouter>
    );

  beforeEach(() => {
    (useSelector as jest.Mock).mockImplementation(() => {
      return initialState;
    });
  });

  it('renders searchBoxContainer correctly', () => {
    renderComponent();

    // check that search box is shown
    expect(
      screen.getByRole('searchbox', { name: 'searchBox.search_text_arialabel' })
    ).toHaveValue('initial search text');

    // check that links are shown correctly
    expect(
      screen.getByRole('link', { name: '"instrument calibration"' })
    ).toHaveAttribute('href', '/searchBox.examples_label_link1');
    expect(
      screen.getByRole('link', { name: 'neutron AND scattering' })
    ).toHaveAttribute('href', '/searchBox.examples_label_link2');

    // check that limited results message is shown
    expect(
      screen.getByText('searchBox.limited_results_message', { exact: false })
    ).toBeInTheDocument();
  });
});

describe('SearchBoxContainerSide - Tests', () => {
  const renderComponent = (): RenderResult =>
    render(
      <MemoryRouter>
        <Provider
          store={configureStore([thunk])({
            dgsearch: initialState,
          })}
        >
          <SearchBoxContainerSide
            initiateSearch={jest.fn()}
            onSearchTextChange={jest.fn()}
            searchText=""
          />
        </Provider>
      </MemoryRouter>
    );

  it('renders searchBoxContainerSide correctly', () => {
    const { asFragment } = renderComponent();
    expect(asFragment()).toMatchSnapshot();
  });
});
