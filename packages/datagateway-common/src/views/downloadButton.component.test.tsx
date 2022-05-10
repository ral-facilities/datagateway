import React from 'react';
import { mount } from 'enzyme';
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
import { MemoryRouter } from 'react-router-dom';
import { ReactWrapper } from 'enzyme';
import { QueryClientProvider, QueryClient } from 'react-query';

jest.mock('../api/datafiles');
jest.mock('../api/datasets');
jest.mock('../api/investigations');

describe('Generic download button', () => {
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
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const props: DownloadButtonProps = {
      entityType: 'datafile',
      entityName: 'test',
      entityId: 1,
      entitySize: 1,
    };
    const textButtonWrapper = createWrapper(props);
    expect(textButtonWrapper.find('button').text()).toBe('buttons.download');

    const iconButtonWrapper = createWrapper({
      ...props,
      variant: 'icon',
    });
    expect(iconButtonWrapper.find('button').text()).toBe('');
  });

  it('calls download investigation on button press for both text and icon buttons', () => {
    const props: DownloadButtonProps = {
      entityType: 'investigation',
      entityName: 'test',
      entityId: 1,
      entitySize: 1,
    };
    let wrapper = createWrapper(props);

    wrapper.find('#download-btn-1').last().simulate('click');
    expect(downloadInvestigation).toHaveBeenCalledWith(
      'https://www.example.com/ids',
      1,
      'test'
    );

    jest.clearAllMocks();

    wrapper = createWrapper({
      ...props,
      variant: 'icon',
    });

    wrapper.find('#download-btn-1').last().simulate('click');
    expect(downloadInvestigation).toHaveBeenCalledWith(
      'https://www.example.com/ids',
      1,
      'test'
    );
  });

  it('calls download dataset on button press for both text and icon buttons', () => {
    const props: DownloadButtonProps = {
      entityType: 'dataset',
      entityName: 'test',
      entityId: 1,
      entitySize: 1,
    };
    let wrapper = createWrapper(props);

    wrapper.find('#download-btn-1').last().simulate('click');
    expect(downloadDataset).toHaveBeenCalledWith(
      'https://www.example.com/ids',
      1,
      'test'
    );

    jest.clearAllMocks();

    wrapper = createWrapper({
      ...props,
      variant: 'icon',
    });

    wrapper.find('#download-btn-1').last().simulate('click');
    expect(downloadDataset).toHaveBeenCalledWith(
      'https://www.example.com/ids',
      1,
      'test'
    );
  });

  it('calls download datafile on button press for both text and icon buttons', () => {
    const props: DownloadButtonProps = {
      entityType: 'datafile',
      entityName: 'test',
      entityId: 1,
      entitySize: 1,
    };
    let wrapper = createWrapper(props);

    wrapper.find('#download-btn-1').last().simulate('click');
    expect(downloadDatafile).toHaveBeenCalledWith(
      'https://www.example.com/ids',
      1,
      'test'
    );

    jest.clearAllMocks();

    wrapper = createWrapper({
      ...props,
      variant: 'icon',
    });

    wrapper.find('#download-btn-1').first().simulate('click');
    expect(downloadDatafile).toHaveBeenCalledWith(
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
      entitySize: 1,
    });

    expect(wrapper.find(DownloadButton).children().length).toBe(0);
  });

  it('renders a tooltip and disabled button if entity size is zero', () => {
    const props: DownloadButtonProps = {
      entityType: 'datafile',
      entityName: 'test',
      entityId: 1,
      entitySize: 0,
    };
    let wrapper = createWrapper(props);

    expect(wrapper.exists('#tooltip-1'));
    wrapper.find('#download-btn-1').first().simulate('click');
    expect(downloadDatafile).not.toHaveBeenCalled();

    jest.clearAllMocks();

    wrapper = createWrapper({
      ...props,
      variant: 'icon',
    });

    expect(wrapper.exists('#tooltip-1'));
    wrapper.find('#download-btn-1').first().simulate('click');
    expect(downloadDatafile).not.toHaveBeenCalled();
  });
});
