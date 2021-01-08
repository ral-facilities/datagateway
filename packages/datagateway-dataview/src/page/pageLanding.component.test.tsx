import React from 'react';
import { ReactWrapper } from 'enzyme';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';

import { createMount } from '@material-ui/core/test-utils';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import { initialState as dgDataViewInitialState } from '../state/reducers/dgdataview.reducer';
import { dGCommonInitialState } from 'datagateway-common';
import ISISInvestigationLanding from '../views/landing/isis/isisInvestigationLanding.component';
import ISISDatasetLanding from '../views/landing/isis/isisDatasetLanding.component';
import PageLanding from './pageLanding.component';
import {
  checkInstrumentAndFacilityCycleId,
  checkInstrumentAndStudyId,
  checkInvestigationId,
} from './idCheckFunctions';
import { flushPromises } from '../setupTests';
import { act } from 'react-dom/test-utils';

jest.mock('loglevel');
jest.mock('./idCheckFunctions');

// The ISIS routes to test.
const ISISRoutes = {
  investigation: '/browse/instrument/1/facilityCycle/1/investigation/1',
  dataset: '/browse/instrument/1/facilityCycle/1/investigation/1/dataset/1',
  studyHierarchy: {
    investigation: '/browseStudyHierarchy/instrument/1/study/1/investigation/1',
    dataset:
      '/browseStudyHierarchy/instrument/1/study/1/investigation/1/dataset/1',
  },
};

describe('PageLanding', () => {
  let mount;
  let state: StateType;

  const createWrapper = (path: string): ReactWrapper => {
    const mockStore = configureStore([thunk]);
    return mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter initialEntries={[{ key: 'testKey', pathname: path }]}>
          <PageLanding />
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );
    (checkInstrumentAndFacilityCycleId as jest.Mock).mockImplementation(() =>
      Promise.resolve(true)
    );
    (checkInstrumentAndStudyId as jest.Mock).mockImplementation(() =>
      Promise.resolve(true)
    );
    (checkInvestigationId as jest.Mock).mockImplementation(() =>
      Promise.resolve(true)
    );
  });

  it('renders ISISInvestigationLanding for ISIS investigation route', async () => {
    const wrapper = createWrapper(ISISRoutes['investigation']);

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the ISISInvestigationsLanding component to be present.
    expect(wrapper.exists(ISISInvestigationLanding)).toBe(true);
  });

  it('does not render ISISInvestigationLanding for incorrect ISIS investigation route', async () => {
    (checkInstrumentAndFacilityCycleId as jest.Mock).mockImplementation(() =>
      Promise.resolve(false)
    );

    const wrapper = createWrapper(ISISRoutes['investigation']);

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the ISISDatasetsTable component not to be present.
    expect(wrapper.exists(ISISInvestigationLanding)).toBe(false);
  });

  it('renders ISISDatasetLanding for ISIS dataset route', async () => {
    const wrapper = createWrapper(ISISRoutes['dataset']);

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the ISISInvestigationsLanding component to be present.
    expect(wrapper.exists(ISISDatasetLanding)).toBe(true);
  });

  it('does not render ISISDatasetLanding for incorrect ISIS dataset route', async () => {
    (checkInstrumentAndFacilityCycleId as jest.Mock).mockImplementation(() =>
      Promise.resolve(false)
    );

    const wrapper = createWrapper(ISISRoutes['dataset']);

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the ISISDatasetsTable component not to be present.
    expect(wrapper.exists(ISISDatasetLanding)).toBe(false);
  });

  it('renders ISISInvestigationLanding for ISIS investigation route for studyHierarchy', async () => {
    const wrapper = createWrapper(
      ISISRoutes['studyHierarchy']['investigation']
    );

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the ISISInvestigationsLanding component to be present.
    expect(wrapper.exists(ISISInvestigationLanding)).toBe(true);
  });

  it('does not render ISISInvestigationLanding for incorrect ISIS investigation route for studyHierarchy', async () => {
    (checkInstrumentAndStudyId as jest.Mock).mockImplementation(() =>
      Promise.resolve(false)
    );

    const wrapper = createWrapper(
      ISISRoutes['studyHierarchy']['investigation']
    );

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the ISISDatasetsTable component not to be present.
    expect(wrapper.exists(ISISInvestigationLanding)).toBe(false);
  });

  it('renders ISISDatasetLanding for ISIS dataset route for studyHierarchy', async () => {
    const wrapper = createWrapper(ISISRoutes['studyHierarchy']['dataset']);

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the ISISInvestigationsLanding component to be present.
    expect(wrapper.exists(ISISDatasetLanding)).toBe(true);
  });

  it('does not render ISISDatasetLanding for incorrect ISIS dataset route for studyHierarchy', async () => {
    (checkInstrumentAndStudyId as jest.Mock).mockImplementation(() =>
      Promise.resolve(false)
    );

    const wrapper = createWrapper(ISISRoutes['studyHierarchy']['dataset']);

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the ISISDatasetsTable component not to be present.
    expect(wrapper.exists(ISISDatasetLanding)).toBe(false);
  });
});
