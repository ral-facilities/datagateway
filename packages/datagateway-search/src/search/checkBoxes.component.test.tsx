import React from 'react';
import { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import { createMount } from '@mui/material/test-utils';
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

    expect(wrapper.find('#search-entities-menu').last().text()).toEqual(
      'searchBox.checkboxes.types (2)'
    );

    wrapper
      .find('#search-entities-menu')
      .find('[role="button"]')
      .simulate('mousedown', { button: 0 });

    const investigationCheckbox = wrapper.find(
      '[aria-label="searchBox.checkboxes.investigation_arialabel"]'
    );
    expect(investigationCheckbox.exists());
    investigationCheckbox.find('input').forEach((node) => {
      expect(node.props().checked).toEqual(false);
    });

    const datasetCheckbox = wrapper.find(
      '[aria-label="searchBox.checkboxes.dataset_arialabel"]'
    );
    expect(datasetCheckbox.exists());
    datasetCheckbox.find('input').forEach((node) => {
      expect(node.props().checked).toEqual(true);
    });

    const datafileCheckbox = wrapper.find(
      '[aria-label="searchBox.checkboxes.datafile_arialabel"]'
    );
    expect(datafileCheckbox.exists()).toEqual(true);
    datafileCheckbox.find('input').forEach((node) => {
      expect(node.props().checked).toEqual(true);
    });
  });

  it('renders correctly when datafiles are not searchable', () => {
    state.dgsearch.searchableEntities = ['investigation', 'dataset'];
    history.replace('/?searchText=&investigation=false');
    const wrapper = createWrapper();

    expect(wrapper.find('#search-entities-menu').last().text()).toEqual(
      'searchBox.checkboxes.types (1)'
    );

    wrapper
      .find('#search-entities-menu')
      .find('[role="button"]')
      .simulate('mousedown', { button: 0 });

    const investigationCheckbox = wrapper.find(
      '[aria-label="searchBox.checkboxes.investigation_arialabel"]'
    );
    expect(investigationCheckbox.exists());
    investigationCheckbox.find('input').forEach((node) => {
      expect(node.props().checked).toEqual(false);
    });

    const datasetCheckbox = wrapper.find(
      '[aria-label="searchBox.checkboxes.dataset_arialabel"]'
    );
    expect(datasetCheckbox.exists());
    datasetCheckbox.find('input').forEach((node) => {
      expect(node.props().checked).toEqual(true);
    });

    expect(
      wrapper
        .find('[aria-label="searchBox.checkboxes.datafile_arialabel"]')
        .exists()
    ).toEqual(false);
  });

  it('renders an error message when nothing is selected', () => {
    history.replace(
      '/?searchText=&investigation=false&dataset=false&datafile=false'
    );
    const wrapper = createWrapper();

    expect(
      wrapper.find('#search-entities-checkbox-label').first().text()
    ).toContain('searchBox.checkboxes.types');

    expect(wrapper.find('.MuiFormHelperText-root').last().text()).toEqual(
      'searchBox.checkboxes.types_error'
    );
  });

  it('pushes URL with new dataset value when user clicks checkbox', () => {
    history.replace('/?searchText=&investigation=false');
    const wrapper = createWrapper();

    wrapper
      .find('#search-entities-menu')
      .find('[role="button"]')
      .simulate('mousedown', { button: 0 });

    wrapper
      .find('[aria-label="searchBox.checkboxes.dataset_arialabel"]')
      .simulate('click');

    expect(pushSpy).toHaveBeenCalledWith('?dataset=false&investigation=false');
  });

  it('pushes URL with new datafile value when user clicks checkbox', () => {
    history.replace('/?searchText=&investigation=false');
    const wrapper = createWrapper();

    wrapper
      .find('#search-entities-menu')
      .find('[role="button"]')
      .simulate('mousedown', { button: 0 });

    wrapper
      .find('[aria-label="searchBox.checkboxes.datafile_arialabel"]')
      .simulate('click');

    expect(pushSpy).toHaveBeenCalledWith('?datafile=false&investigation=false');
  });

  it('pushes URL with new investigation value when user clicks checkbox', () => {
    history.replace('/?searchText=&investigation=false');
    const wrapper = createWrapper();

    wrapper
      .find('#search-entities-menu')
      .find('[role="button"]')
      .simulate('mousedown', { button: 0 });

    wrapper
      .find('[aria-label="searchBox.checkboxes.investigation_arialabel"]')
      .simulate('click');

    expect(pushSpy).toHaveBeenCalledWith('?');
  });
});
