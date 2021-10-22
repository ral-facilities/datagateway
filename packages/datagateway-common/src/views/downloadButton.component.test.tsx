import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import DownloadButton, {
  DownloadButtonProps,
} from './downloadButton.component';
import configureStore from 'redux-mock-store';
import { initialState as dGCommonInitialState } from '../state/reducers/dgcommon.reducer';
import { downloadDatafile } from '../api/datafiles';
import { downloadDataset } from '../api/datasets';
import { downloadInvestigation } from '../api/investigations';
import { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router';
import { ReactWrapper } from 'enzyme';
import { QueryClientProvider, QueryClient } from 'react-query';

jest.mock('../api/datafiles');
jest.mock('../api/datasets');
jest.mock('../api/investigations');

describe('Generic download button', () => {
  let mount;
  const mockStore = configureStore([thunk]);
  let state: StateType;

  const createWrapper = (props: DownloadButtonProps): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <MemoryRouter>
          <QueryClientProvider client={new QueryClient()}>
            <DownloadButton {...props} />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();

    state = JSON.parse(
      JSON.stringify({
        dgdataview: {}, //Dont need to fill, since not part of the test
        dgcommon: {
          ...dGCommonInitialState,
          urls: {
            ...dGCommonInitialState.urls,
            idsUrl: 'https://www.example.com/ids',
          },
        },
      })
    );
  });

  afterEach(() => {
    mount.cleanUp();
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const textButtonWrapper = createWrapper({
      entityType: 'datafile',
      entityName: 'test',
      entityId: 1,
    });
    expect(textButtonWrapper.find('button').text()).toBe('buttons.download');

    const iconButtonWrapper = createWrapper({
      entityType: 'datafile',
      entityName: 'test',
      entityId: 1,
      variant: 'icon',
    });
    expect(iconButtonWrapper.find('button').text()).toBe('');
  });

  it('calls download investigation on button press for both text and icon buttons', () => {
    let wrapper = createWrapper({
      entityType: 'investigation',
      entityName: 'test',
      entityId: 1,
    });

    wrapper.find('#download-btn-1').first().simulate('click');
    expect(downloadInvestigation).toHaveBeenCalledWith(
      'https://www.example.com/ids',
      1,
      'test'
    );

    jest.clearAllMocks();

    wrapper = createWrapper({
      entityType: 'investigation',
      entityName: 'test',
      entityId: 1,
      variant: 'icon',
    });

    wrapper.find('#download-btn-1').first().simulate('click');
    expect(downloadInvestigation).toHaveBeenCalledWith(
      'https://www.example.com/ids',
      1,
      'test'
    );
  });

  it('calls download dataset on button press for both text and icon buttons', () => {
    let wrapper = createWrapper({
      entityType: 'dataset',
      entityName: 'test',
      entityId: 1,
    });

    wrapper.find('#download-btn-1').first().simulate('click');
    expect(downloadDataset).toHaveBeenCalledWith(
      'https://www.example.com/ids',
      1,
      'test'
    );

    jest.clearAllMocks();

    wrapper = createWrapper({
      entityType: 'dataset',
      entityName: 'test',
      entityId: 1,
      variant: 'icon',
    });

    wrapper.find('#download-btn-1').first().simulate('click');
    expect(downloadDataset).toHaveBeenCalledWith(
      'https://www.example.com/ids',
      1,
      'test'
    );
  });

  it('calls download datafile on button press for both text and icon buttons', () => {
    let wrapper = createWrapper({
      entityType: 'datafile',
      entityName: 'test',
      entityId: 1,
    });

    wrapper.find('#download-btn-1').first().simulate('click');
    expect(downloadDatafile).toHaveBeenCalledWith(
      'https://www.example.com/ids',
      1,
      'test'
    );

    jest.clearAllMocks();

    wrapper = createWrapper({
      entityType: 'dataset',
      entityName: 'test',
      entityId: 1,
      variant: 'icon',
    });

    wrapper.find('#download-btn-1').first().simulate('click');
    expect(downloadDataset).toHaveBeenCalledWith(
      'https://www.example.com/ids',
      1,
      'test'
    );
  });

  it('renders nothing when entityName is undefined', () => {
    const wrapper = createWrapper({
      entityType: 'datafile',
      entityName: undefined,
      entityId: 1,
    });

    expect(wrapper.find(DownloadButton).children().length).toBe(0);
  });
});
