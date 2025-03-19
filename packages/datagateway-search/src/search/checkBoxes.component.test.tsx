import type { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import CheckBoxesGroup from './checkBoxes.component';
import thunk from 'redux-thunk';
import { initialState } from '../state/reducers/dgsearch.reducer';
import { createMemoryHistory, type History } from 'history';
import { Router } from 'react-router-dom';
import { render, type RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('loglevel');

describe('Checkbox component tests', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let state: StateType;
  const mockStore = configureStore([thunk]);
  let testStore: ReturnType<typeof mockStore>;
  let history: History;
  let pushSpy: jest.SpyInstance;

  function renderComponent(): RenderResult {
    return render(
      <Provider store={testStore}>
        <Router history={history}>
          <CheckBoxesGroup />
        </Router>
      </Provider>
    );
  }

  beforeEach(() => {
    user = userEvent.setup();
    history = createMemoryHistory();
    pushSpy = jest.spyOn(history, 'push');

    state = JSON.parse(JSON.stringify({ dgsearch: initialState }));

    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
      },
      searchableEntities: ['investigation', 'dataset', 'datafile'],
      settingsLoaded: true,
    };

    testStore = mockStore(state);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a dropdown button that expands to show search type checkboxes', async () => {
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

    await user.click(
      screen.getByRole('button', {
        name: 'searchBox.checkboxes.types (2)',
      })
    );
    await user.click(
      screen.getByRole('checkbox', {
        name: 'searchBox.checkboxes.dataset_arialabel',
      })
    );

    expect(pushSpy).toHaveBeenCalledWith(
      '?searchText=&dataset=false&investigation=false'
    );
  });

  it('pushes URL with new datafile value when user clicks checkbox', async () => {
    history.replace('/?searchText=&investigation=false');
    renderComponent();

    await user.click(
      screen.getByRole('button', {
        name: 'searchBox.checkboxes.types (2)',
      })
    );
    await user.click(
      screen.getByRole('checkbox', {
        name: 'searchBox.checkboxes.datafile_arialabel',
      })
    );

    expect(pushSpy).toHaveBeenCalledWith(
      '?searchText=&datafile=false&investigation=false'
    );
  });

  it('pushes URL with new investigation value when user clicks checkbox', async () => {
    history.replace('/?searchText=&investigation=false');
    renderComponent();

    await user.click(
      screen.getByRole('button', {
        name: 'searchBox.checkboxes.types (2)',
      })
    );
    await user.click(
      screen.getByRole('checkbox', {
        name: 'searchBox.checkboxes.investigation_arialabel',
      })
    );

    expect(pushSpy).toHaveBeenCalledWith('?searchText=');
  });
});
