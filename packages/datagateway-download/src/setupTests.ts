import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

// Unofficial React 17 Enzyme adapter
Enzyme.configure({ adapter: new Adapter() });

function noOp(): void {
  // required as work-around for enzyme/jest environment not implementing window.URL.createObjectURL method
}

if (typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', { value: noOp });
}

export const flushPromises = (): Promise<void> => new Promise(setImmediate);

// Mock lodash.debounce to return the function we want to call.
jest.mock('lodash.debounce', () => (fn: (args: unknown) => unknown) => fn);
