import * as React from 'react';
import { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import CheckBoxesGroup from './checkBoxes.component';
import thunk from 'redux-thunk';
import { initialState } from '../state/reducers/dgsearch.reducer';
import { createMemoryHistory, History } from 'history';
import { Router } from 'react-router-dom';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';
import { render, type RenderResult, screen } from '@testing-library/react';

jest.mock('loglevel');

describe('Checkbox component tests', () => {
  let state: StateType;
  let mockStore;
  let testStore;
  let history: History;
  let pushSpy;
  let user: UserEvent;

  const renderComponent = (h: History = history): RenderResult =>
    render(
      <Provider store={testStore}>
        <Router history={h}>
          <CheckBoxesGroup />
        </Router>
      </Provider>
    );

  beforeEach(() => {
    history = createMemoryHistory();
    user = userEvent.setup();
    pushSpy = jest.spyOn(history, 'push');

    state = JSON.parse(JSON.stringify({ dgsearch: initialState }));

    state.dgsearch = {
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
      },
      requestReceived: false,
      searchData: {
        dataset: [],
        datafile: [],
        investigation: [],
      },
      searchableEntities: ['investigation', 'dataset', 'datafile'],
      settingsLoaded: true,
    };

    mockStore = configureStore([thunk]);
    testStore = mockStore(state);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    history.replace('/?searchText=&investigation=false');
    renderComponent();

    // open the dropdown
    await user.click(await screen.findByRole('button'));

    const investigationCheckbox = await screen.findByRole('checkbox', {
      name: 'searchBox.checkboxes.investigation_arialabel',
    });
    expect(investigationCheckbox).not.toBeChecked();

    const datasetCheckbox = await screen.findByRole('checkbox', {
      name: 'searchBox.checkboxes.dataset_arialabel',
    });
    expect(datasetCheckbox).toBeChecked();

    const datafileCheckbox = await screen.findByRole('checkbox', {
      name: 'searchBox.checkboxes.datafile_arialabel',
    });
    expect(datafileCheckbox).toBeChecked();
  });

  it('renders correctly when datafiles are not searchable', async () => {
    state.dgsearch.searchableEntities = ['investigation', 'dataset'];
    history.replace('/?searchText=&investigation=false');
    renderComponent();

    // open the dropdown
    await user.click(await screen.findByRole('button'));

    const investigationCheckbox = await screen.findByRole('checkbox', {
      name: 'searchBox.checkboxes.investigation_arialabel',
    });
    expect(investigationCheckbox).not.toBeChecked();

    const datasetCheckbox = await screen.findByRole('checkbox', {
      name: 'searchBox.checkboxes.dataset_arialabel',
    });
    expect(datasetCheckbox).toBeChecked();

    expect(
      screen.queryByRole('checkbox', {
        name: 'searchBox.checkboxes.datafile_arialabel',
      })
    ).toBeNull();
  });

  it('renders an error message when nothing is selected', async () => {
    history.replace(
      '/?searchText=&investigation=false&dataset=false&datafile=false'
    );
    renderComponent();

    expect(
      await screen.findByText('searchBox.checkboxes.types_error')
    ).toBeInTheDocument();
  });

  it('pushes URL with new dataset value when user clicks checkbox', async () => {
    history.replace('/?searchText=&investigation=false');
    renderComponent();

    // open the dropdown
    await user.click(await screen.findByRole('button'));

    await user.click(
      await screen.findByRole('checkbox', {
        name: 'searchBox.checkboxes.dataset_arialabel',
      })
    );

    expect(pushSpy).toHaveBeenCalledWith('?dataset=false&investigation=false');
  });

  it('pushes URL with new datafile value when user clicks checkbox', async () => {
    history.replace('/?searchText=&investigation=false');
    renderComponent();

    // open the dropdown
    await user.click(await screen.findByRole('button'));

    await user.click(
      await screen.findByRole('checkbox', {
        name: 'searchBox.checkboxes.datafile_arialabel',
      })
    );

    expect(pushSpy).toHaveBeenCalledWith('?datafile=false&investigation=false');
  });

  it('pushes URL with new investigation value when user clicks checkbox', async () => {
    history.replace('/?searchText=&investigation=false');
    renderComponent();

    // open the dropdown
    await user.click(await screen.findByRole('button'));

    await user.click(
      await screen.findByRole('checkbox', {
        name: 'searchBox.checkboxes.investigation_arialabel',
      })
    );

    expect(pushSpy).toHaveBeenCalledWith('?');
  });
});
