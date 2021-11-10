import React from 'react';
import { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import { createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import CheckBoxesGroup from './checkBoxes.component';
import thunk from 'redux-thunk';
import { initialState } from '../state/reducers/dgsearch.reducer';
import { createMemoryHistory, History } from 'history';
import { Router } from 'react-router-dom';

jest.mock('loglevel');

describe('Checkbox component tests', () => {
  let mount;
  let state: StateType;
  let mockStore;
  let testStore;
  let history: History;
  let pushSpy;

  const createWrapper = (h: History = history): ReactWrapper => {
    return mount(
      <Provider store={testStore}>
        <Router history={h}>
          <CheckBoxesGroup />
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();
    history = createMemoryHistory();
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

  it('renders correctly', () => {
    history.replace('/?searchText=&investigation=false');
    const wrapper = createWrapper();
    const investigationCheckbox = wrapper.find(
      '[aria-label="Investigation checkbox"]'
    );
    expect(investigationCheckbox.exists());
    investigationCheckbox.find('input').forEach((node) => {
      expect(node.props().checked).toEqual(false);
    });

    const datasetCheckbox = wrapper.find('[aria-label="Dataset checkbox"]');
    expect(datasetCheckbox.exists());
    datasetCheckbox.find('input').forEach((node) => {
      expect(node.props().checked).toEqual(true);
    });

    const datafileCheckbox = wrapper.find('[aria-label="Datafile checkbox"]');
    expect(datafileCheckbox.exists());
    datafileCheckbox.find('input').forEach((node) => {
      expect(node.props().checked).toEqual(true);
    });
  });

  it('renders correctly when datafiles are not searchable', () => {
    state.dgsearch.searchableEntities = ['investigation', 'dataset'];
    history.replace('/?searchText=&investigation=false');
    const wrapper = createWrapper();
    const investigationCheckbox = wrapper.find(
      '[aria-label="Investigation checkbox"]'
    );
    expect(investigationCheckbox.exists());
    investigationCheckbox.find('input').forEach((node) => {
      expect(node.props().checked).toEqual(false);
    });

    const datasetCheckbox = wrapper.find('[aria-label="Dataset checkbox"]');
    expect(datasetCheckbox.exists());
    datasetCheckbox.find('input').forEach((node) => {
      expect(node.props().checked).toEqual(true);
    });

    expect(wrapper.find('[aria-label="Datafile checkbox"]').exists()).toEqual(
      false
    );
  });

  it('pushes URL with new dataset value when user clicks checkbox', () => {
    history.replace('/?searchText=&investigation=false');
    const wrapper = createWrapper();

    wrapper
      .find('[aria-label="searchBox.checkboxes.dataset_arialabel"]')
      .simulate('change');

    expect(pushSpy).toHaveBeenCalledWith('?dataset=false&investigation=false');
  });

  it('pushes URL with new datafile value when user clicks checkbox', () => {
    history.replace('/?searchText=&investigation=false');
    const wrapper = createWrapper();

    wrapper
      .find('[aria-label="searchBox.checkboxes.datafile_arialabel"]')
      .simulate('change');

    expect(pushSpy).toHaveBeenCalledWith('?datafile=false&investigation=false');
  });

  it('pushes URL with new investigation value when user clicks checkbox', () => {
    history.replace('/?searchText=&investigation=false');
    const wrapper = createWrapper();

    wrapper
      .find('[aria-label="searchBox.checkboxes.investigation_arialabel"]')
      .simulate('change');

    expect(pushSpy).toHaveBeenCalledWith('?');
  });
});
