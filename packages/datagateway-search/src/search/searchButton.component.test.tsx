// import React from 'react';
// import { StateType } from '../state/app.types';
// import { Provider } from 'react-redux';
// import { createShallow, createMount } from '@material-ui/core/test-utils';
// import configureStore from 'redux-mock-store';
// import SearchButton from './searchButton.component';
// import thunk from 'redux-thunk';
// import { MemoryRouter } from 'react-router';
// import { initialState } from '../state/reducers/dgsearch.reducer';
// import { submitSearchText } from '../state/actions/actions';

// jest.mock('loglevel');

// describe('Search Button component tests', () => {
//   let shallow;
//   let state: StateType;
//   let mockStore;
//   let mount;

//   beforeEach(() => {
//     shallow = createShallow({ untilSelector: 'div' });
//     mount = createMount();

//     state = JSON.parse(JSON.stringify({ dgsearch: initialState }));

//     state.dgsearch = {
//       searchText: '',
//       text: '',
//       selectDate: {
//         startDate: null,
//         endDate: null,
//       },
//       checkBox: {
//         dataset: true,
//         datafile: true,
//         investigation: false,
//       },
//     };

//     mockStore = configureStore([thunk]);
//   });

//   //   it('renders correctly', () => {
//   //     const wrapper = shallow(<div><SearchButton store={mockStore(state)} /></div>);
//   //     expect(wrapper).toMatchSnapshot();
//   //   });

//   //   it('sends submitSearchText action when user clicks checkbox', () => {
//   //     const testStore = mockStore(state);
//   //     const wrapper = mount(
//   //       <Provider store={testStore}>
//   //         <MemoryRouter>
//   //           <SearchButton />
//   //         </MemoryRouter>
//   //       </Provider>
//   //     );

//   //     wrapper.find('[aria-label="submit search button"]').simulate('click');

//   // test that

//   // test that it sends off a request

//   // test that correct params are generated
// });
