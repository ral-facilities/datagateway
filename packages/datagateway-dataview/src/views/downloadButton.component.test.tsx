import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import DownloadButton from './downloadButton.component';
import configureStore from 'redux-mock-store';
import {
  dGCommonInitialState,
  downloadDatafileRequest,
  downloadDatasetRequest,
  StateType,
} from 'datagateway-common';
import { initialState as dgDataViewInitialState } from '../state/reducers/dgdataview.reducer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router';
import axios from 'axios';

describe('Generic download button', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;
  (axios.get as jest.Mock).mockImplementation(() =>
    Promise.resolve({ data: [] })
  );
  global.Date.now = jest.fn(() => 1);

  beforeEach(() => {
    shallow = createShallow();
    mount = createMount();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <DownloadButton
        store={mockStore(state)}
        entityType="dataset"
        entityId={1}
        entityName="test"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('sends download dataset action on button press', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DownloadButton entityType="dataset" entityId={1} entityName="test" />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('#download-btn').first().simulate('click');
    expect(testStore.getActions()).toHaveLength(1);
    expect(testStore.getActions()[0]).toEqual(downloadDatasetRequest(1));
  });

  it('sends download datafile action on button press', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DownloadButton
            entityType="datafile"
            entityId={1}
            entityName="test"
          />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('#download-btn').first().simulate('click');
    expect(testStore.getActions()).toHaveLength(1);
    expect(testStore.getActions()[0]).toEqual(downloadDatafileRequest(1));
  });
});
