import * as React from 'react';
import { Provider } from 'react-redux';
import type { RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';
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
  function renderComponent({ initialState }): RenderResult {
    return render(
      <Provider store={configureStore([thunk])(initialState)}>
        <MemoryRouter>
          <SearchBoxContainer
            initiateSearch={jest.fn()}
            onSearchTextChange={jest.fn()}
            searchText=""
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
        searchableEntities: [],
      },
    };
  });

  it('renders searchBoxContainer correctly', () => {
    const { asFragment } = renderComponent({ initialState: state });
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('SearchBoxContainerSide - Tests', () => {
  function renderComponent({ initialState }): RenderResult {
    return render(
      <Provider store={configureStore([thunk])(initialState)}>
        <MemoryRouter>
          <SearchBoxContainerSide
            initiateSearch={jest.fn()}
            onSearchTextChange={jest.fn()}
            searchText=""
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
        searchableEntities: [],
      },
    };
  });

  it('renders searchBoxContainerSide correctly', () => {
    const { asFragment } = renderComponent({ initialState: state });

    expect(asFragment()).toMatchSnapshot();
  });
});
