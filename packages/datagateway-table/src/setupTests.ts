import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Action } from 'redux';
import { StateType } from './state/app.types';
import { initialState } from './state/reducers/dgtable.reducer';
// React 16 Enzyme adapter
Enzyme.configure({ adapter: new Adapter() });

// below required as work-around for enzyme/jest environment not implementing window.URL.createObjectURL method
function noOp(): void {}

if (typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', { value: noOp });
}

// these are used for testing async actions
export let actions: Action[] = [];
export const resetActions = (): void => {
  actions = [];
};
export const getState = (): Partial<StateType> => ({ dgtable: initialState });
export const dispatch = (action: Action): void | Promise<void> => {
  if (typeof action === 'function') {
    action(dispatch, getState);
    return Promise.resolve();
  } else {
    actions.push(action);
  }
};

// Mock lodash.debounce to return the function we want to call.
jest.mock('lodash.debounce', () => (fn: Function) => fn);
