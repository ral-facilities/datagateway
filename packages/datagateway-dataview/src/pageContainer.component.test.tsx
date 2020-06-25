import React from 'react';
import { ReactWrapper } from 'enzyme';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from './state/app.types';
import { initialState as dgDataViewInitialState } from './state/reducers/dgdataview.reducer';
import { dGCommonInitialState } from 'datagateway-common';

import { createShallow } from '@material-ui/core/test-utils';
// history package is part of react-router, which we depend on
// eslint-disable-next-line import/no-extraneous-dependencies
import { createLocation } from 'history';
import { MemoryRouter } from 'react-router';

import PageContainer from './pageContainer.component';
// import { I18nextProvider } from 'react-i18next';
// import i18n from 'i18next';
// import { initReactI18next } from 'react-i18next';
// i18n.use(initReactI18next).init({
//   lng: 'en',
//   fallbackLng: 'en',
//   // have a common namespace used around the full app
//   ns: ['translations'],
//   defaultNS: 'translations',
//   debug: true,
//   interpolation: {
//     escapeValue: false, // not needed for react!!
//   },
//   resources: { en: { translations: {} } },
// });

jest.mock('loglevel');

describe('PageContainer - Tests', () => {
  let shallow;
  let state: StateType;

  const createWrapper = (state: StateType): ReactWrapper => {
    const mockStore = configureStore([thunk]);
    return shallow(
      <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
        <PageContainer store={mockStore(state)} />
      </MemoryRouter>
      // {
      //   wrappingComponent: I18nextProvider,
      //   wrappingComponentProps: {
      //     i18n,
      //   },
      // }
    );
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'Grid' });

    state = JSON.parse(
      JSON.stringify({
        dgcommon: { ...dGCommonInitialState, totalDataCount: 101 },
        dgdataview: dgDataViewInitialState,

        router: {
          action: 'POP',
          location: createLocation('/'),
        },
      })
    );
  });

  it('displays the correct entity count', () => {
    // Set up store with the test state and mounted page head.
    const wrapper = createWrapper(state);

    expect(wrapper).toMatchSnapshot();
  });
});
