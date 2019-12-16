import React from 'react';
import { ReactWrapper } from 'enzyme';
import { StateType } from '../state/app.types';
import {
  toggleDataset,
  toggleDatafile,
  toggleInvestigation,
} from '../state/actions/actions';
import { createShallow } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import CheckBoxesGroup from './checkBoxes.component';
import thunk from 'redux-thunk';
import { initialState } from '../state/reducers/dgsearch.reducer';

jest.mock('loglevel');

describe('Checkbox component tests', () => {
  let shallow;
  let state: StateType;
  let mockStore;

  beforeEach(() => {
    shallow = createShallow( {untilSelector: 'div'} )
    state = JSON.parse(JSON.stringify({ dgtable: initialState }));

    mockStore = configureStore([thunk]);
 
  });

 // it('renders correctly', () => {
  //   const wrapper = shallow(<CheckBoxesGroup store={mockStore(state)} />);
  //   expect(wrapper).toMatchSnapshot();
  // });

it('sends a toggleDataset action when user clicks checkbox', () => {
    const testStore = mockStore(state);
    const wrapper = shallow(<CheckBoxesGroup store={mockStore(state)} />);
    
  });

}


 